import * as path from 'path';
import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { WEEKDAY } from '../../types';
import {
  UserModel,
  UserRecord,
  TABLE_NAME,
  FIELDS
} from '../models/user_model';

const DB_PATH = path.join(__dirname, 'test_db', 'user_model_test.db');
let DB_CONNECTION;
let User;
let lastSqlStr = '';
function getSqlStr(str: string) {
  lastSqlStr = str;
}

const testEmail = 'alan@gmail.com';

beforeAll(done => {
  let failedConnection = null;
  let didFail = false;
  try {
    failedConnection = new sqlite(DB_PATH, { fileMustExist: true });
  } catch (e) {
    didFail = true;
  }
  expect(didFail).toBe(true);

  // creates new DB
  DB_CONNECTION = new sqlite(DB_PATH, {
    verbose: getSqlStr
  });
  expect(DB_CONNECTION.open).toBe(true);

  User = new UserModel(DB_CONNECTION);

  done();
});

afterAll(done => {
  DB_CONNECTION.close();
  expect(DB_CONNECTION.open).toBe(false);

  done();
});

describe('User Model:', () => {
  /**
   * 1) can't create a table without at least one field
   * 2) creates correct string from a schema with two fields
   */
  it('should be able to instantiate the User obj', () => {
    expect(User).not.toBeNull();
    expect(User.fields).toBe(FIELDS);
  });

  // For the default Model.create() method
  xit('should be able to create the table', () => {
    const expectedQuery = `CREATE TABLE IF NOT EXISTS User
    (id INTEGER PRIMARY KEY NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      coffee_days TEXT DEFAULT 1234,
      skip_next_match INTEGER DEFAULT 0,
      warning_exception INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      is_faculty INTEGER DEFAULT 0)`;

    const { rawQuery } = User.initTable();
    const trimReceived = rawQuery.replace(/\s+/g, ' ').trim();
    const trimExpected = expectedQuery.replace(/\s+/g, ' ').trim();

    expect(trimReceived).toBe(trimExpected);
  });

  // FINAL version: tests the User overload of the create() method
  it('should be able to create the table', () => {
    const expectedQuery = `CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      coffee_days TEXT DEFAULT 1234,
      skip_next_match INTEGER DEFAULT 0,
      warning_exception INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      is_faculty INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      CHECK (is_faculty in (0,1)),
      CHECK (is_active in (0,1)),
      CHECK (skip_next_match in (0,1)),
      CHECK (warning_exception in (0,1))
    )`;

    const { rawQuery } = User.initTable();
    const trimReceived = rawQuery.replace(/\s+/g, ' ').trim();
    const trimExpected = expectedQuery.replace(/\s+/g, ' ').trim();
    const trimLastSqlStr = lastSqlStr.replace(/\s+/g, ' ').trim();

    expect(trimLastSqlStr).toBe(trimExpected);
    expect(trimReceived).toBe(trimExpected);
  });

  it('should be able to count the records in the table', () => {
    const numRecords = User.count();

    expect(numRecords).toBe(0);
  });

  it('should be able to add records to the table', () => {
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

  // NOTE: this depends on the prior test
  it('should not be able to add the same person to the database', () => {
    const user_1 = {
      email: 'alan@gmail.com',
      full_name: 'alan bot'
    };
    let error = null;
    expect(User.count()).toBe(1);
    try {
      User.add(user_1);
    } catch (e) {
      error = e;
    }

    expect(User.count()).toBe(1);
    expect(error).not.toBeNull();
    expect(error.message).toBe('UNIQUE constraint failed: User.email');
  });

  // TODO: move this into base_model test
  xit('should be able to find records to the table', () => {
    const email = 'alan@gmail.com';
    const foundUsers = User.find({ email });
    expect(foundUsers.length).toBe(1);

    const firstUser = foundUsers[0];
    expect(firstUser.email).toBe(email);
  });

  // TODO: move this into the base_model test
  xit('should be able to update a users record', () => {
    const original_email = 'alan@gmail.com';
    const new_email = 'blaaaaaah@gmail.com';
    const originalUser = User.find({ email: original_email })[0];
    expect(originalUser.email).toBe('alan@gmail.com');

    const { changes } = User.update(
      { email: new_email },
      { email: original_email }
    );
    expect(changes).toBe(1);

    const oldUser = User.find({ email: original_email });
    expect(oldUser.length).toBe(0);

    const newUser = User.find({ email: new_email });
    expect(newUser.length).toBe(1);
    expect(newUser[0].email).toBe(new_email);
  });

  // TODO: make a remove record method
  xit('should be able to remove a given user', () => {});

  // =========== MORE SPECIFIC TO USER ==========
  it('should be able to find a user by id', () => {
    const results = User.findById(1);
    expect(results).toHaveProperty('id', 1);
  });

  it('should return null for nonexistant id', () => {
    const results = User.findById(4);
    expect(results).toBeNull();
  });

  it('should be able to update the users weekdays', () => {
    const { changes } = User.updateDays(testEmail, [WEEKDAY.TUE, WEEKDAY.MON]);
    expect(changes).toBe(1);

    const updatedUser = User.findById(1);
    expect(updatedUser.coffee_days).toBe('12');
  });

  it('Should be able to update a users warning setting', () => {
    const originalUser = User.findById(1);
    expect(originalUser.warning_exception).toBe(0);

    const { changes } = User.updateWarnings(testEmail, true);
    expect(changes).toBe(1);

    const updatedUser = User.findById(1);
    expect(updatedUser.warning_exception).toBe(1);
  });

  it('Should be able to update a users skip next match', () => {
    const originalUser = User.findById(1);
    expect(originalUser.skip_next_match).toBe(0);

    const { changes } = User.updateSkipNextMatch(testEmail, true);
    expect(changes).toBe(1);

    const updatedUser = User.findById(1);
    expect(updatedUser.skip_next_match).toBe(1);
  });
});
