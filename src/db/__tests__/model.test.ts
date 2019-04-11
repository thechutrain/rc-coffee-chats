/**
 * NOTE: most of the base model class funcitonality is tested by
 * the user model that extends the base class
 */
import * as path from 'path';
import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { Model } from '../models/base_model';

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

xdescribe('Db base model', () => {
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
    const { rawQuery } = testModel.initTable();
    const trimQuery = rawQuery.replace(/\s+/g, ' ').trim();
    expect(trimQuery).toBe(
      `CREATE TABLE IF NOT EXISTS ModelTest (id INTEGER PRIMARY KEY UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL)`
    );
  });

  it('should be able to count the records in the table', () => {
    const testModel = new Model<modelRecord>(DB_CONNECTION, TABLE_NAME, FIELDS);
    const numRecords = testModel.count();

    expect(numRecords).toBe(0);
  });

  it('should be able to add records to the table');
});
