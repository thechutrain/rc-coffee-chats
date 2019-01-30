import * as rimraf from 'rimraf';
import * as path from 'path';
import { initUserModel, IUserDB } from './user';
import sqlite from 'better-sqlite3';

const DB_FILE_NAME = 'user-test.db';

beforeAll(() => {
  // const dataDir = path.join(__dirname, '../../', '.data/');
  // const fullDbPath = path.join(dataDir, DB_FILE_NAME);
  const dbPath = path.join(__dirname, DB_FILE_NAME);
  rimraf.sync(dbPath, {}, err => {
    if (err) {
      console.log(err);
    }
    expect(err).not.toBeDefined();
  });
});

afterEach(() => {
  const dbPath = path.join(__dirname, DB_FILE_NAME);
  const db = new sqlite(dbPath);
  expect(db).toBeDefined();
  // Delete all records
  const dropStmt = db.prepare(`DELETE FROM User WHERE true`);
  dropStmt.run();
  // check that there are no more records
  const { count } = initUserModel(db);
  expect(count()).toBe(0);
});

afterAll(() => {
  const dbPath = path.join(__dirname, DB_FILE_NAME);
  const db = new sqlite(dbPath);
  expect(db).toBeDefined();
  // Drop the table?
  db.close();
});

describe('User Model test', () => {
  it('should be able to create an empty table', () => {
    const dbPath = path.join(__dirname, DB_FILE_NAME);
    const db = new sqlite(dbPath);
    expect(db).toBeDefined();

    const { createTable, count } = initUserModel(db);

    createTable();
    const numUsers = count();

    expect(numUsers).toBe(0);
    const response = createTable();
    expect(response.status).toBe('SUCCESS');

    db.close();
  });

  it('should be able to add a single user to the User table', () => {
    const dbPath = path.join(__dirname, DB_FILE_NAME);
    const db = new sqlite(dbPath);
    expect(db).toBeDefined();

    const { add, count } = initUserModel(db);
    expect(count()).toBe(0);
    const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
    add(fooUser);
    expect(count()).toBe(1);

    // Delete all records
    // const dropStmt = db.prepare(`DELETE FROM User WHERE true`);
    // dropStmt.run();
    // // check that there are no more records
    // expect(count()).toBe(0);
  });

  it('should not recreate table if a table has been created already', () => {
    const dbPath = path.join(__dirname, DB_FILE_NAME);
    const db = new sqlite(dbPath);
    expect(db).toBeDefined();

    const { add, count, createTable } = initUserModel(db);
    expect(count()).toBe(0);
    const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
    add(fooUser);
    expect(count()).toBe(1);

    createTable();
    expect(count()).toBe(1);

    // Delete all records
    // const dropStmt = db.prepare(`DELETE FROM User WHERE true`);
    // dropStmt.run();
    // // check that there are no more records
    // expect(count()).toBe(0);
  });

  it('should not be able to add duplicate users', () => {
    const dbPath = path.join(__dirname, DB_FILE_NAME);
    const db = new sqlite(dbPath);
    expect(db).toBeDefined();

    const { add, count } = initUserModel(db);
    expect(count()).toBe(0);
    const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
    add(fooUser);
    expect(count()).toBe(1);

    // Should not be able to add same user twice
    const errResponse = add(fooUser);
    expect(count()).toBe(1);
    expect(errResponse.status).toBe('FAILURE');

    // Delete all records
    // const dropStmt = db.prepare(`DELETE FROM User WHERE true`);
    // dropStmt.run();
    // // check that there are no more records
    // expect(count()).toBe(0);
  });

  it('should be able to add a different users to the User table', () => {
    const dbPath = path.join(__dirname, DB_FILE_NAME);
    const db = new sqlite(dbPath);
    expect(db).toBeDefined();

    const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
    const barUser = { email: 'bar@gmail.com', full_name: 'Bar Bar' };
    const { add, count } = initUserModel(db);

    expect(count()).toBe(0);
    add(fooUser);
    expect(count()).toBe(1);
    add(barUser);
    expect(count()).toBe(2);

    // Delete all records
    // const dropStmt = db.prepare(`DELETE FROM User WHERE true`);
    // dropStmt.run();
    // // check that there are no more records
    // expect(count()).toBe(0);
  });

  it('should be able to find a single user to the User table', () => {
    const dbPath = path.join(__dirname, DB_FILE_NAME);
    const db = new sqlite(dbPath);
    expect(db).toBeDefined();

    const { count, add, find } = initUserModel(db);
    const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
    add(fooUser);
    expect(count()).toBe(1);
    const findResult = find('foo@gmail.com');

    expect(findResult.status).toBe('SUCCESS');
    expect(findResult.payload).toBeDefined();
    expect(findResult.payload).toMatchObject(fooUser);

    // Delete all records
    // const dropStmt = db.prepare(`DELETE FROM User WHERE true`);
    // dropStmt.run();
    // // check that there are no more records
    // expect(count()).toBe(0);
  });

  // TODO:
  it('should be able to update a single user in the User table', () => {
    const dbPath = path.join(__dirname, DB_FILE_NAME);
    const db = new sqlite(dbPath);
    expect(db).toBeDefined();

    const { add, find, update } = initUserModel(db);
    const orgUser = { email: 'foo@gmail.com', full_name: 'Foo foo' };
    add(orgUser);
    const { payload: createdUser } = find('foo@gmail.com');
    expect(createdUser).toMatchObject(orgUser);

    const orgWarnings = (createdUser as IUserDB).warning_exception;

    update('foo@gmail.com', { warning_exception: !orgWarnings });
    const { payload: updatedUser } = find('foo@gmail.com');

    expect(updatedUser.warning_exception).toBe(1);
  });
});
