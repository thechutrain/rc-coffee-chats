/**
 * TODO: scaffold db.prepare && db.exec()
 * TODO: add schema
 */
import * as path from 'path';
import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { Model } from '../model';

const DB_PATH = path.join(__dirname, 'base-model-test.db');
let DB_CONNECTION;

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
type modelRecord = {
  id: number;
  email: string;
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
  DB_CONNECTION = new sqlite(DB_PATH);
  expect(DB_CONNECTION.open).toBe(true);
});

afterAll(() => {
  DB_CONNECTION.close();
  expect(DB_CONNECTION.open).toBe(false);
});

describe('Db base model', () => {
  /**
   * 1) can't create a table without at least one field
   * 2) creates correct string from a schema with two fields
   */
  it('should be able to instantiate the model with db record', () => {
    const testModel = new Model<modelRecord>(DB_CONNECTION, TABLE_NAME, FIELDS);
    expect(testModel).not.toBeNull();
  });

  // Note: just checks that the sql string is correct
  it('should be able to create the table', () => {
    const testModel = new Model<modelRecord>(DB_CONNECTION, TABLE_NAME, FIELDS);
    const { rawQuery } = testModel.create();
    const trimQuery = rawQuery.replace(/\s+/g, ' ').trim();
    expect(trimQuery).toBe(
      `CREATE TABLE IF NOT EXISTS ModelTest (id INTEGER PRIMARY KEY UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL)`
    );
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
