import sqlite from 'better-sqlite3';
import { Model } from './model';

import * as path from 'path';
import * as types from './dbTypes';

export const TABLE_NAME = 'User';
export const UserModelFields: types.fields = {
  id: {
    type: 'INTEGER',
    isPrimaryKey: true,
    isNotNull: true,
    isUnique: true
  },
  email: {
    type: 'TEXT',
    isUnique: true,
    isNotNull: true
  },
  full_name: {
    type: 'TEXT',
    isNotNull: true
  },
  coffee_days: {
    type: 'TEXT',
    defaultValue: '1234'
  },
  warning_exception: {
    type: 'INTEGER',
    defaultValue: '0'
  },
  is_active: {
    type: 'INTEGER',
    defaultValue: '1'
  },
  is_faculty: {
    type: 'INTEGER',
    defaultValue: '0'
  }
};

export class UserModel extends Model {
  protected readonly tableName = TABLE_NAME;
  protected fields: types.fields = UserModelFields;

  constructor(db) {
    super(db);

    Model.createTable(this.tableName, this.fields);
  }

  // public createTable() {
  //   // const query = `CREATE TABLE IF NOT EXISTS User (
  //   //   id INTEGER PRIMARY KEY NOT NULL UNIQUE,
  //   //   email TEXT NOT NULL UNIQUE,
  //   //   full_name TEXT NOT NULL,
  //   //   coffee_days TEXT DEFAULT 1234,
  //   //   skip_next_match INTEGER DEFAULT 0,
  //   //   warning_exception INTEGER DEFAULT 0,
  //   //   is_active INTEGER DEFAULT 1,
  //   //   is_faculty INTEGER DEFAULT 0,
  //   //   is_alum INTEGER DEFAULT 0,
  //   //   CHECK (is_alum in (0,1)),
  //   //   CHECK (is_faculty in (0,1)),
  //   //   CHECK (is_active in (0,1)),
  //   //   CHECK (skip_next_match in (0,1)),
  //   //   CHECK (warning_exception in (0,1))
  //   // )`;

  //   const fieldsAsArray: string[] = Object.keys(this.fields).map(field => {
  //     const {
  //       type,
  //       isPrimaryKey,
  //       isUnique,
  //       isNotNull,
  //       defaultValue
  //     } = this.fields[field];
  //     let fieldStr = `${field} ${type}`;
  //     if (isPrimaryKey) {
  //       fieldStr = fieldStr + ' PRIMARY KEY';
  //     }
  //     if (isUnique) {
  //       fieldStr = fieldStr + ' UNIQUE';
  //     }
  //     if (isNotNull) {
  //       fieldStr = fieldStr + ' NOT NULL';
  //     }
  //     if (defaultValue && defaultValue !== '') {
  //       fieldStr = fieldStr + ' DEFAULT ' + defaultValue;
  //     }

  //     return fieldStr;
  //   });

  //   const queryBody = fieldsAsArray.join(',\n');

  //   const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${queryBody})`;

  //   console.log(query);

  //   this.db.exec(query);
  // }

  // creates a newRecord
  // TODO: make this flexible
  public newRecord() {
    // creates a new user
  }

  public exists(): boolean {
    return false;
  }

  // QUESTION: how to make args of find
  // be a record where key has to be property
  public find() {
    // returns user | user[]
  }

  public update() {}
}

// ========= TESTING!!!! ===============
const DB_PATH = path.join(__dirname, '-user-model-test.db');
const user = new UserModel(new sqlite(DB_PATH));
// user.count();
