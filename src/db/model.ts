import sqlite from 'better-sqlite3';
import * as types from './dbTypes';

export abstract class Model {
  static db: sqlite;
  // NOTE: add tableName, fields should be part of an interface!
  protected tableName: string; // ex. User
  protected fields: types.fields;

  static createTable(tableName: string, fields: types.fields, relations?: any) {
    if (!Model.db) {
      throw new Error(`No database intialized`);
    }
    // 1) Get each field pertaining to column, ex. username TEXT NOT NULL,
    const fieldsAsArray: string[] = Object.keys(fields).map(field => {
      const { type, isPrimaryKey, isUnique, isNotNull, defaultValue } = fields[
        field
      ];
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

    const queryBody = fieldsAsArray.join(',\n');
    const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${queryBody})`;

    console.log(query);
    Model.db.exec(query);
  }

  constructor(db: sqlite) {
    if (!Model.db) {
      Model.db = db;
    }
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
