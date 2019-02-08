import * as path from 'path';
import { initUserModel } from '../user';
// import { initMatchModel } from '../match';
import sqlite from 'better-sqlite3';
import { WEEKDAYS } from '../../constants';

const DB_PATH = path.join(__dirname, 'user-test.db');

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
  const db = new sqlite(DB_PATH);
  expect(db.open).toBe(true);

  // create User table
  const { createTable, count } = initUserModel(db);
  let error = null;
  try {
    createTable();
  } catch (e) {
    error = e;
  }
  expect(count()).toBe(0);
  expect(error).toBeNull();

  db.close();
  expect(db.open).toBe(false);
});

// afterEach(() => {
//   const db = new sqlite(DB_PATH, { fileMustExist: true });
//   expect(db.open).toBe(true);

//   // Delete all records
//   const dropStmt = db.prepare(`DELETE FROM User WHERE true`);
//   dropStmt.run();

//   // check that there are n more records
//   const { count } = initUserModel(db);
//   expect(count()).toBe(0);
// });

// Unnecessary?
// it('should NOT recreate table if a table has been created already', () => {
//   const db = new sqlite(DB_PATH, { fileMustExist: true });
//   expect(db.open).toBe(true);

//   const { add, count, createTable } = initUserModel(db);
//   expect(count()).toBe(0);
//   const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
//   add(fooUser);
//   expect(count()).toBe(1);
//   createTable();
//   expect(count()).toBe(1);
// });

describe('User Model test', () => {
  ///////////////
  // ADDING a user
  ////////////////
  it('should ADD new user', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { add, count } = initUserModel(db);
    expect(count()).toBe(0);
    const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
    add(fooUser);
    expect(count()).toBe(1);
  });

  it('should NOT add DUPLICATE users', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { add, count, _deleteRecords } = initUserModel(db);
    _deleteRecords();
    expect(count()).toBe(0);

    const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
    add(fooUser);
    expect(count()).toBe(1);

    // Should not be able to add same user twice
    const errResponse = add(fooUser);
    expect(count()).toBe(1);
    expect(errResponse.status).toBe('ERROR');
  });

  it('should add MULIT different users to the User table', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
    const barUser = { email: 'bar@gmail.com', full_name: 'Bar Bar' };

    const { add, count, _deleteRecords } = initUserModel(db);
    _deleteRecords();
    expect(count()).toBe(0);

    add(fooUser);
    expect(count()).toBe(1);
    add(barUser);
    expect(count()).toBe(2);
  });

  it('should ADD user with given Coffee Day preference', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { count, add, find, _deleteRecords } = initUserModel(db);
    _deleteRecords();
    expect(count()).toBe(0);

    // Clean Table:
    add({ email: 'b@foo.com', full_name: 'only weekends', coffee_days: '06' });

    const foundUser = find('b@foo.com');
    expect(foundUser.coffee_days).toBe('06');
  });

  //////////////////
  // FINDING User / vals
  /////////////////
  it('should FIND a user that EXISTS', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { count, add, find, _deleteRecords } = initUserModel(db);
    _deleteRecords();
    expect(count()).toBe(0);

    const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
    add(fooUser);
    expect(count()).toBe(1);

    const foundUser = find('foo@gmail.com');

    expect(foundUser).toMatchObject(fooUser);
  });

  it('should FIND a user that EXISTS', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { count, add, findUserByEmail, _deleteRecords } = initUserModel(db);
    _deleteRecords();
    expect(count()).toBe(0);

    const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
    add(fooUser);
    expect(count()).toBe(1);

    const { payload: foundUser } = findUserByEmail('foo@gmail.com');

    expect(foundUser).toMatchObject(fooUser);
  });

  it('should NOT FIND a user that does NOT EXISTS', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { count, find, _deleteRecords } = initUserModel(db);
    _deleteRecords();
    expect(count()).toBe(0);

    const notfoundUser = find('foo@gmail.com');

    expect(notfoundUser).toBeNull();
  });

  ////////////////////
  // UPDATE
  ////////////////////
  it('should UPDATE coffee days of a user', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { count, find, add, updateCoffeeDays } = initUserModel(db);
    expect(count()).toBe(0);

    const defaultUser = {
      email: 'default@gmail.com',
      full_name: 'default user'
    };
    add(defaultUser);

    // Check that the default days are correct
    expect(find(defaultUser.email)).toMatchObject({
      coffee_days: '1234'
    });

    const newDays = ['SUN', 'WED'];
    const sqlStatus = updateCoffeeDays(defaultUser.email, newDays);
    expect(sqlStatus.status).toBe('OK');

    // Check that they've been successfully changed
    expect(find(defaultUser.email)).toMatchObject({
      coffee_days: '03'
    });
  });
});
