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

  get primaryKey(): string {
    return Object.keys(this.fields).filter(s => this.fields[s].isPrimaryKey)[0];
  }

  get foreignKeys(): string[] {
    return Object.keys(this.fields).filter(s => this.fields[s].foreignKey);
  }

  public __createTable() {
    console.log(this.foreignKeys);
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

    const queryBody = queryBodyArr.join(',\n');
    const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
${queryBody})`;

    // console.log(query);
    Model.db.exec(query);
  }

  /**
   * simple validation that ensures all queryArgs exist as column/fields & runs isValideFn
   * NOTE: not really necessary since sqlite3 will throw us an error :)
   * @param queryArgs
   */
  // NOTE: can pass in function.name && tableName too
  public __validateQueryArgs(queryArgs = {}, noPrimaryKey = true): void {
    for (const argKey in queryArgs) {
      if (!Object.prototype.hasOwnProperty.call(this.fields, argKey)) {
        // ErrorType: extra arg that is not related to any field
        throw new Error(
          `add a new record was provided a key of "${argKey}" that is not associated with any field on the table "${
            this.tableName
          }"`
        );
      }

      const { isValidFn } = this.fields[argKey];

      if (isValidFn && !isValidFn(queryArgs[argKey])) {
        // ErrorType: arg failed validation
        throw new Error(
          `provided argument of "${queryArgs[argKey]}" failed validation`
        );
      }
    }

    // ===== Ensure no primary keys ======
    if (noPrimaryKey) {
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
    }
  }

  public find(queryArgs = {}): any[] {
    this.__validateQueryArgs(queryArgs, false);
    const { db } = Model;

    let query;
    if (Object.keys(queryArgs).length === 0) {
      query = db.prepare(`SELECT * FROM ${this.tableName}`);
    } else {
      const whereArr = Object.keys(queryArgs).map(f => `${f} = @${f}`);
      // console.log(
      //   `SELECT * from ${this.tableName} WHERE ${whereArr.join(' AND ')}`
      // );

      query = db.prepare(
        `SELECT * from ${this.tableName} WHERE ${whereArr.join(' AND ')}`
      );
    }
    const result = query.all(queryArgs);
    console.log(result);
    return result;
  }

  // public findOne(queryArgs = {}): any {}

  public add(queryArgs = {}): { changes: number; lastInsertROWID: number } {
    this.__validateQueryArgs(queryArgs, true);
    const { db } = Model;
    // NOTE: do not have to do this in sqlite3, since we can still create the
    // table. However we need to do this in
    // 4) Check that any Foreign Keys vals exist in separate tables:

    // 5) create query
    const fields = Object.keys(queryArgs);
    const fieldPlaceholder = fields.map(f => `@${f}`);

    const queryStr = `INSERT INTO ${this.tableName} (
      ${fields.join(', ')}
      ) VALUES (
      ${fieldPlaceholder.join(', ')}
      )`;

    // 6) run query
    const query = db.prepare(queryStr);
    const result = query.run(queryArgs);

    console.log(result);
    return result;
  }

  public update(queryArgs = {}): { changes: number; lastInsertROWID: number } {
    const foundRecords = this.find(queryArgs);
    if (foundRecords.length === 0) {
      throw new Error('Found no records to update');
    }

    // Use the primary key
    // const primaryKey = Object.keys(this.fields).filter(
    //   s => this.fields[s].isPrimaryKey
    // )[0];

    console.log(this.primaryKey);

    this.__validateQueryArgs(queryArgs, true); // Default, cant update primary keys!
    const { db } = Model;

    return {
      changes: 1,
      lastInsertROWID: 1
    };
  }

  // public remove(queryArgs = {}) {
  //   // TODO:
  // }
  public count(): number {
    // Note: this will point to actual child usermodel ect. :)
    const countQuery = Model.db.prepare(
      `SELECT COUNT(id) FROM ${this.tableName}`
    );

    const { 'COUNT(id)': numRecord } = countQuery.get();

    return numRecord;
  }
}
