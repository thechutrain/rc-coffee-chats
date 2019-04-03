import * as path from 'path';
import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { UserModel, UserRecord, TABLE_NAME, FIELDS } from '../models/user';

const DB_PATH = path.join(__dirname, 'user-model-test.db');
let DB_CONNECTION;

beforeAll(() => {
  let failedConnection = false;
  try {
    // tslint:disable-next-line
    new sqlite(DB_PATH, { fileMustExist: true });
  } catch (e) {
    failedConnection = true;
  }
  expect(failedConnection).toBe(true);

  // creates new DB
  DB_CONNECTION = new sqlite(DB_PATH);
  expect(DB_CONNECTION.open).toBe(true);
});

afterAll(() => {
  DB_CONNECTION.close();
  expect(DB_CONNECTION.open).toBe(false);
});

describe('User Model:', () => {
  /**
   * 1) can't create a table without at least one field
   * 2) creates correct string from a schema with two fields
   */
  it('should be able to instantiate the User obj', () => {
    const User = new UserModel(DB_CONNECTION);
    expect(User).not.toBeNull();
    expect(User.fields).toBe(FIELDS);
  });

  // Note: just checks that the sql string is correct
  it('should be able to create the table', () => {
    const User = new UserModel(DB_CONNECTION);

    const { rawQuery } = User.create();
    const trimQuery = rawQuery.replace(/\s+/g, ' ').trim();
    expect(trimQuery).toBe(
      `CREATE TABLE IF NOT EXISTS User (id INTEGER PRIMARY KEY UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, full_name TEXT NOT NULL, coffee_days TEXT, warning_exception INTEGER, is_active INTEGER, is_faculty INTEGER)`
    );
  });

  it('should be able to count the records in the table', () => {
    const User = new UserModel(DB_CONNECTION);
    const numRecords = User.count();

    expect(numRecords).toBe(0);
  });

  it('should be able to add records to the table', () => {
    const User = new UserModel(DB_CONNECTION);
    const user_1 = {
      email: 'alan@gmail.com',
      full_name: 'alan bot'
    };
    expect(User.count()).toBe(0);
    const { changes, lastInsertRowid } = User.add(user_1);

    expect(User.count()).toBe(1);
    expect(changes).toBe(1);
    expect(lastInsertRowid).toBe(1);
  });
  it('should be able to find records to the table', () => {});

  it('should be able to add records to the table', () => {});
});

// describe('Db base model: create()', () => {
//   /**
//    * 1) can't create a table without at least one field
//    * 2) creates correct string from a schema with two fields
//    */
//   it('should have created a new table without any records', () => {
//     // const numUsers = User.count();
//     // expect(numUsers).toBe(0);
//   });
// });
