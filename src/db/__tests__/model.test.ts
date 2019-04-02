/**
 * TODO: scaffold db.prepare && db.exec()
 * TODO: add schema
 */
import * as path from 'path';
import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { Model } from '../model';

const DB_PATH = path.join(__dirname, 'base-model-test.db');

const TABLE_NAME = 'ModelTest';
const FIELDS: types.fieldListing = {
  id: {
    colName: 'id',
    type: types.sqliteType.INTEGER,
    meta: {
      isPrimaryKey: true,
      isNotNull: true,
      isUnique: true
    }
  },
  email: {
    colName: 'email',
    type: types.sqliteType.TEXT,
    meta: {
      isUnique: true,
      isNotNull: true
    }
  }
};

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
  const db = new sqlite(DB_PATH);
  expect(db.open).toBe(true);
});

describe('Db base model: create()', () => {
  /**
   * 1) can't create a table without at least one field
   * 2) creates correct string from a schema with two fields
   */
  it('should be able to create a table', () => {
    // throw new Error('blah');
    expect(true).toBe(true);
  });
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
