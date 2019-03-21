import * as path from 'path';
import sqlite from 'better-sqlite3';
import { UserModel } from '../user';

const DB_PATH = path.join(__dirname, 'user-test.db');
let db;
let User;

/**
 * beforeAll queries, make a new database for testing this single table
 */
beforeAll(() => {
  // Ensures that creating brand new .db file
  // Should fail to connect to existing db (ensures rimraf removed old .db files)
  let failedConnection = false;
  try {
    // tslint:disable-next-line
    new sqlite(DB_PATH, { fileMustExist: true });
  } catch (e) {
    failedConnection = true;
  }
  expect(failedConnection).toBe(true);

  // creates new DB
  db = new sqlite(DB_PATH);
  expect(db.open).toBe(true);

  // create userModel
  User = new UserModel(db);
});

afterAll(() => {
  db.close();
  expect(db.open).toBe(false);
});

describe('User Model test', () => {
  it('should have created a new table without any records', () => {
    const numUsers = User.count();
    expect(numUsers).toBe(0);
  });
});
