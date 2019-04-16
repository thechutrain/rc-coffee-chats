/**
 * Tests the features of the base model only
 */

import * as path from 'path';
import sqlite from 'better-sqlite3';
// import { UserModel, FIELDS } from '../models/user_model';
import { Model } from '../models/__base_model';

const DB_PATH = path.join(__dirname, 'test_db', 'base_model.db');
let DB_CONNECTION;
// let base_model: Model | null = null;
let last_sql_str = '';
function getSqlStr(str: string) {
  last_sql_str = str;
}

beforeAll(done => {
  let failedConnection = null;
  let didFail = false;
  try {
    failedConnection = new sqlite(DB_PATH, { fileMustExist: true });
  } catch (e) {
    didFail = true;
  }
  expect(didFail).toBe(true);

  // creates new DB Connection
  DB_CONNECTION = new sqlite(DB_PATH, { verbose: getSqlStr });
  expect(DB_CONNECTION.open).toBe(true);
  done();
});

// base_model = new Model(DB_CONNECTION);
afterAll(done => {
  DB_CONNECTION.close();
  expect(DB_CONNECTION.open).toBe(false);

  done();
});

describe('Tests for Model class:', () => {
  /**
   * - Should be able to create a table from given fields
   * - should be able to get the primary key of a table
   * - should be able to initalize a table
   * - should e able to find records
   * - should be able to add records
   * - should be able to update records
   * - should be able to remove records
   * - should be able to count the number of records
   * - should be able to validate query args
   */

  xit('should be able to instantiate the User obj', () => {
    // expect(User).not.toBeNull();
    // expect(User.fields).toBe(FIELDS);
  });

  // For the default Model.create() method
  xit('should be able to create the table', () => {
    // const expectedQuery = `CREATE TABLE IF NOT EXISTS User
    // (id INTEGER PRIMARY KEY NOT NULL UNIQUE,
    //   email TEXT NOT NULL UNIQUE,
    //   full_name TEXT NOT NULL,
    //   coffee_days TEXT DEFAULT 1234,
    //   skip_next_match INTEGER DEFAULT 0,
    //   warning_exception INTEGER DEFAULT 0,
    //   is_active INTEGER DEFAULT 1,
    //   is_faculty INTEGER DEFAULT 0)`;
    // const { rawQuery } = User.initTable();
    // const trimReceived = rawQuery.replace(/\s+/g, ' ').trim();
    // const trimExpected = expectedQuery.replace(/\s+/g, ' ').trim();
    // expect(trimReceived).toBe(trimExpected);
  });

  xit('should be able to count the records in the table', () => {
    // const numRecords = User.count();
    // expect(numRecords).toBe(0);
  });

  xit('should be able to add records to the table', () => {
    // const user_1 = {
    //   email: 'alan@gmail.com',
    //   full_name: 'alan bot'
    // };
    // expect(User.count()).toBe(0);
    // const { changes, lastInsertRowid } = User.add(user_1);
    // expect(User.count()).toBe(1);
    // expect(changes).toBe(1);
    // expect(lastInsertRowid).toBe(1);
  });

  // NOTE: this depends on the prior test
  xit('should not be able to add the same person to the database', () => {
    // const user_1 = {
    //   email: 'alan@gmail.com',
    //   full_name: 'alan bot'
    // };
    // let error = null;
    // expect(User.count()).toBe(1);
    // try {
    //   User.add(user_1);
    // } catch (e) {
    //   error = e;
    // }
    // expect(User.count()).toBe(1);
    // expect(error).not.toBeNull();
    // expect(error.message).toBe('UNIQUE constraint failed: User.email');
  });

  // TODO: move this into base_model test
  xit('should be able to find records to the table', () => {
    // const email = 'alan@gmail.com';
    // const foundUsers = User.find({ email });
    // expect(foundUsers.length).toBe(1);
    // const firstUser = foundUsers[0];
    // expect(firstUser.email).toBe(email);
  });

  xit('should be able to update a users record', () => {
    // const original_email = 'alan@gmail.com';
    // const new_email = 'blaaaaaah@gmail.com';
    // const originalUser = User.find({ email: original_email })[0];
    // expect(originalUser.email).toBe('alan@gmail.com');
    // const { changes } = User.update(
    //   { email: new_email },
    //   { email: original_email }
    // );
    // expect(changes).toBe(1);
    // const oldUser = User.find({ email: original_email });
    // expect(oldUser.length).toBe(0);
    // const newUser = User.find({ email: new_email });
    // expect(newUser.length).toBe(1);
    // expect(newUser[0].email).toBe(new_email);
  });

  // TODO: make a remove record method
  xit('should be able to remove a given user', () => {});
});
