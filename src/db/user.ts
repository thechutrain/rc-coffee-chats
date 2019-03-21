import sqlite from 'better-sqlite3';
import { Model } from './model';

import * as path from 'path';

// import { castBoolInt } from '../utils/index';

// export const SqliteType = ['NULL', 'INTEGER', 'REAL', 'TEXT', 'BLOB'];

import * as types from './dbTypes';

export class UserModel extends Model {
  protected readonly tableName = 'User';
  protected fields: types.fields = {
    name: {
      dataType: 'TEXT'
    }
  };

  constructor(db) {
    super(db);

    // this.createTable();
  }

  public test() {
    console.log(this.db);
  }

  // Creates table if it hasnt been made in the database etc.
  public createTable() {
    // console.log(`calling create table ${this.db}`);

    const query = `CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      coffee_days TEXT DEFAULT 1234,
      skip_next_match INTEGER DEFAULT 0,
      warning_exception INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      is_faculty INTEGER DEFAULT 0,
      is_alum INTEGER DEFAULT 0,
      CHECK (is_alum in (0,1)),
      CHECK (is_faculty in (0,1)),
      CHECK (is_active in (0,1)),
      CHECK (skip_next_match in (0,1)),
      CHECK (warning_exception in (0,1))
    )`;

    this.db.exec(query);
  }

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

// TESTING!!!!
const DB_PATH = path.join(__dirname, 'usermodel-test.db');
const user = new UserModel(new sqlite(DB_PATH));
user.test();
