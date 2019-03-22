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
  protected relations: types.IRelation[];

  static createTable(
    tableName: string,
    fields: types.fields,
    relations: types.IRelation[] = []
  ) {
    // if (!Model.db) {
    //   throw new Error(`No database intialized`);
    // }
    // // 1) Get each field pertaining to column, ex. username TEXT NOT NULL,
    // const fieldsAsArray: string[] = Object.keys(fields).map(field => {
    //   const { type, isPrimaryKey, isUnique, isNotNull, defaultValue } = fields[
    //     field
    //   ];
    //   let fieldStr = `${field} ${type}`;
    //   if (isPrimaryKey) {
    //     fieldStr = fieldStr + ' PRIMARY KEY';
    //   }
    //   if (isUnique) {
    //     fieldStr = fieldStr + ' UNIQUE';
    //   }
    //   if (isNotNull) {
    //     fieldStr = fieldStr + ' NOT NULL';
    //   }
    //   if (defaultValue && defaultValue !== '') {
    //     fieldStr = fieldStr + ' DEFAULT ' + defaultValue;
    //   }
    //   return fieldStr;
    // });
    // if (fieldsAsArray.length === 0) {
    //   throw new Error('Must have at least one field in the table');
    // }
    // // 2) process any of the relations:
    // const relationsAsArray: string[] = relations.map(r => {
    //   return `FOREIGN KEY (${r.foreignKey}) REFERENCES ${r.refTable} (${
    //     r.refColumn
    //   })
    //    ON DELETE CASCADE ON UPDATE NO ACTION
    //   `;
    // });
    // const queryBody = fieldsAsArray.concat(relationsAsArray).join(',\n');
    // const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${queryBody})`;
    // console.log(query);
    // Model.db.exec(query);
  }

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

    if (!this.fields || !this.tableName || !this.relations) {
      throw new Error(
        'need to have tableName, fields, relations on child class'
      );
    }

    // 2) Get each field pertaining to column, ex. username TEXT NOT NULL,
    const fieldsAsArray: string[] = Object.keys(this.fields).map(field => {
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

      return fieldStr;
    });

    if (fieldsAsArray.length === 0) {
      throw new Error('Must have at least one field in the table');
    }

    // 3) process any of the relations:
    const relationsAsArray: string[] = this.relations.map(r => {
      return `FOREIGN KEY (${r.foreignKey}) REFERENCES ${r.refTable} (${
        r.refColumn
      })
       ON DELETE CASCADE ON UPDATE NO ACTION
      `;
    });
    const queryBody = fieldsAsArray.concat(relationsAsArray).join(',\n');
    const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${queryBody})`;

    // console.log(query);
    Model.db.exec(query);
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
