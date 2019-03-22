import sqlite from 'better-sqlite3';
import * as types from './dbTypes';

/** NOTES:
 * - need to check that there is only one primary key selected
 *
 */

export abstract class Model {
  static db: sqlite;
  // NOTE: add tableName, fields should be part of an interface!
  protected tableName: string; // ex. User
  protected fields: types.fields;
  protected relations?: types.IRelation[];

  constructor(db: sqlite) {
    if (!Model.db) {
      Model.db = db;
    }
  }

  public __createTable() {
    // 1) Validate that we can make a new table
    if (!Model.db) {
      throw new Error(`No database intialized`);
    }

    if (!this.fields || !this.tableName) {
      throw new Error(
        'need to have tableName, fields, relations on child class'
      );
    }

    const queryBodyArr: string[] = [];
    // 2) Get each field pertaining to column, ex. username TEXT NOT NULL,
    Object.keys(this.fields).forEach(field => {
      const {
        type,
        isPrimaryKey,
        isUnique,
        isNotNull,
        defaultValue
      } = this.fields[field];
      let fieldStr = `${field} ${type}`;
      if (isPrimaryKey) {
        fieldStr = fieldStr + ' PRIMARY KEY';
      }
      if (isUnique) {
        fieldStr = fieldStr + ' UNIQUE';
      }
      if (isNotNull) {
        fieldStr = fieldStr + ' NOT NULL';
      }
      if (defaultValue && defaultValue !== '') {
        fieldStr = fieldStr + ' DEFAULT ' + defaultValue;
      }

      queryBodyArr.push(fieldStr);
    });

    if (queryBodyArr.length === 0) {
      throw new Error('Must have at least one field in the table');
    }
    for (const fieldStr in this.fields) {
      const field = this.fields[fieldStr];
      if (field.hasOwnProperty('foreignKey')) {
        const fkField = this.fields[fieldStr] as types.IFkField;
        const { refTable, refColumn } = fkField.foreignKey;

        queryBodyArr.push(
          `FOREIGN KEY (${fieldStr}) REFERENCES ${refTable} (${refColumn})
          ON DELETE CASCADE ON UPDATE NO ACTION`
        );
      }
    }
    // const relationsAsArray = Object.keys(this.fields)
    //   .filter(field => {
    //     return Object.prototype.hasOwnProperty(this.fields[field], 'as');
    //     // const { foreignKey } = this.fields[field];
    //     // return !!foreignKey;
    //   })
    //   .map(fkField => {
    //     // QUESTION: is typescript not smart enough to know that these should be there?
    //     // Or do I have to update my type?
    //     const {
    //       foreignKey: { refTable, refColumn }
    //     } = this.fields[fkField] as types.IFkField;

    //     return `FOREIGN KEY (${fkField}) REFERENCES ${refTable} (${refColumn})
    //     ON DELETE CASCADE ON UPDATE NO ACTION`;
    //   });

    // console.log(queryBodyArr);

    // 3) process any of the relations:
    // TODO: replace this and create from the fields themselves
    // if (this.relations) {
    //   const relationsAsArray: string[] = this.relations.map(r => {
    //     return `FOREIGN KEY (${r.foreignKey}) REFERENCES ${r.refTable} (${
    //       r.refColumn
    //     }) ON DELETE CASCADE ON UPDATE NO ACTION`;
    //   });
    //   queryBodyArr = queryBodyArr.concat(relationsAsArray);
    // }

    const queryBody = queryBodyArr.join(',\n');
    const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
${queryBody})`;

    console.log(query);
    Model.db.exec(query);
  }

  // IMPORTANT: this does not consider the case w
  public add(queryArgs = {}): { changes: number; lastInsertROWID: number } {
    const { db } = Model;
    // 1) figure out what the required params are:
    // Map through the Fields & filter for
    // fields that are isNotNull == true && isPrimaryKey == false
    const reqFields = Object.keys(this.fields).filter(field => {
      const { isPrimaryKey, isNotNull } = this.fields[field];
      // Note: since primary key will autoincrement, never allow users to
      // specify primary key when adding a new record
      return isPrimaryKey ? false : isNotNull;
    });

    // 2) determine that the given args has those required params
    for (const field of reqFields) {
      if (!Object.prototype.hasOwnProperty.call(queryArgs, field)) {
        // ErrorType: missing required field
        throw new Error(
          `cannot add a new record in table "${
            this.tableName
          }" because you are missing an argument of "${field}"`
        );
      }
    }

    // 3) invoke the validatorFn for each field && check if arg
    // is in the field?
    for (const argKey in queryArgs) {
      if (!Object.prototype.hasOwnProperty.call(this.fields, argKey)) {
        // ErrorType: extra arg that is not related to any field
        throw new Error(
          `add a new record was provided a key of "${argKey}" that is not associated with any field on the table "${
            this.tableName
          }"`
        );
      }

      const { validatorFn } = this.fields[argKey];

      if (validatorFn && validatorFn(queryArgs[argKey])) {
        // ErrorType: arg failed validation
        throw new Error(
          `provided argument of "${queryArgs[argKey]}" failed validation`
        );
      }
    }

    // 4) create query
    const fields = Object.keys(queryArgs);
    const fieldPlaceholder = fields.map(f => `@${f}`);

    const queryStr = `INSERT INTO ${this.tableName} (
      ${fields.join(', ')}
      ) VALUES (
      ${fieldPlaceholder.join(', ')}
      )`;

    // 5) run query
    const query = db.prepare(queryStr);
    const result = query.run(queryArgs);

    console.log(result);
    return result;
  }

  public count(): number {
    // Note: this will point to actual child usermodel ect. :)
    const countQuery = Model.db.prepare(
      `SELECT COUNT(id) FROM ${this.tableName}`
    );

    const { 'COUNT(id)': numRecord } = countQuery.get();

    return numRecord;
  }
}
