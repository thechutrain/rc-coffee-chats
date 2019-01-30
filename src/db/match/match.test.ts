import * as rimraf from 'rimraf';
import * as path from 'path';
import { initMatchModel } from './match';
import { initUserModel } from '../user/user';
import sqlite from 'better-sqlite3';

const DB_FILE_NAME = 'match-test.db';

// Global Scope:
let userTable;

function initUserTable() {
  const dbPath = path.join(__dirname, DB_FILE_NAME);
  const db = new sqlite(dbPath);
  const { createTable, add } = initUserModel(db);
  createTable();

  const usersToAdd = [
    {
      email: 'a@gmail.com',
      full_name: 'a user'
    },
    {
      email: 'b@gmail.com',
      full_name: 'b user'
    },
    {
      email: 'c@gmail.com',
      full_name: 'c user'
    },
    {
      email: 'd@gmail.com',
      full_name: 'd user'
    }
  ];

  const userMap = {};
  usersToAdd.forEach(user => {
    const { status, payload } = add(user);
    if (status === 'FAILURE') {
      throw new Error('Error adding users from initUserTable()');
    }
    userMap[payload.user_id] = payload;
  });

  userTable = Object.freeze(userMap);
}

beforeAll(() => {
  const dbPath = path.join(__dirname, DB_FILE_NAME);
  rimraf.sync(dbPath, {}, err => {
    if (err) {
      console.log(err);
    }
    expect(err).not.toBeDefined();

    // Create a user's table
    initUserTable();
    const numUsers = Object.keys(userTable).length;
    expect(numUsers).toBe(4);
  });
});

afterEach(() => {
  const dbPath = path.join(__dirname, DB_FILE_NAME);
  const db = new sqlite(dbPath);
  expect(db).toBeDefined();

  const { createTable, cleanTable, count } = initMatchModel(db);
  createTable();
  // ===== Delete all records =====
  cleanTable();

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
  // === CREATE table query
  it('should be able to create an empty table', () => {
    const dbPath = path.join(__dirname, DB_FILE_NAME);
    const db = new sqlite(dbPath);
    expect(db).toBeDefined();

    const { createTable, count } = initMatchModel(db);

    createTable();

    const numUsers = count();
    expect(numUsers).toBe(0);
    const response = createTable();
    expect(response.status).toBe('SUCCESS');
    db.close();
  });

  it('should not recreate table if a table has been created already', () => {
    const dbPath = path.join(__dirname, DB_FILE_NAME);
    const db = new sqlite(dbPath);
    expect(db).toBeDefined();

    const { add, count, createTable } = initMatchModel(db);

    expect(count()).toBe(0);

    // add(fooUser);

    // expect(count()).toBe(1);

    createTable();

    // expect(count()).toBe(1);
  });

  // === INSERT queries ===
  it('should be able to add a single match to the Match table', () => {
    const dbPath = path.join(__dirname, DB_FILE_NAME);
    const db = new sqlite(dbPath);
    expect(db).toBeDefined();
    const { add, count } = initMatchModel(db);

    expect(count()).toBe(0);

    add();

    expect(count()).toBe(1);
  });

  // it('should be able to add multiple matches on different days', () => {
  //   const dbPath = path.join(__dirname, DB_FILE_NAME);
  //   const db = new sqlite(dbPath);
  //   expect(db).toBeDefined();
  //   const { add, count } = initMatchModel(db);
  //   expect(count()).toBe(0);
  //   const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };

  //   // add(fooUser);
  //   expect(count()).toBe(1);

  //   // const errResponse = add(fooUser);
  //   expect(count()).toBe(1);
  //   expect(errResponse.status).toBe('FAILURE');
  // });

  // OPTIONAL - repetitive?
  // it('should be able to add various different matches for a given user', () => {
  //   const dbPath = path.join(__dirname, DB_FILE_NAME);
  //   const db = new sqlite(dbPath);
  //   expect(db).toBeDefined();

  //   const { add, count } = initMatchModel(db);
  //   expect(count()).toBe(0);
  // });

  // === UPDATE queries ===
  // it('should be able to update a match dates raincheck status', () => {
  //   const dbPath = path.join(__dirname, DB_FILE_NAME);
  //   const db = new sqlite(dbPath);
  //   expect(db).toBeDefined();

  //   const { add, find, update } = initMatchModel(db);
  //   const orgUser = { email: 'foo@gmail.com', full_name: 'Foo foo' };
  //   add(orgUser);
  //   const { payload: createdUser } = find('foo@gmail.com');
  //   expect(createdUser).toMatchObject(orgUser);
  //   const orgWarnings = (createdUser as IUserDB).warning_exception;
  //   update('foo@gmail.com', { warning_exception: !orgWarnings });
  //   const { payload: updatedUser } = find('foo@gmail.com');
  //   expect(updatedUser.warning_exception).toBe(1);
  // });

  // === FIND queries ===
  // it('should be able to find all previous matches of given user', () => {
  //   const dbPath = path.join(__dirname, DB_FILE_NAME);
  //   const db = new sqlite(dbPath);
  //   expect(db).toBeDefined();
  //   const { count, add, find } = initMatchModel(db);
  //   const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
  //   add(fooUser);
  //   expect(count()).toBe(1);
  //   const findResult = find('foo@gmail.com');
  //   expect(findResult.status).toBe('SUCCESS');
  //   expect(findResult.payload).toBeDefined();
  //   expect(findResult.payload).toMatchObject(fooUser);
  // });

  // it('should be able to find all previous matches', () => {
  //   const dbPath = path.join(__dirname, DB_FILE_NAME);
  //   const db = new sqlite(dbPath);
  //   expect(db).toBeDefined();

  //   const { add, find, update } = initMatchModel(db);
  //   const orgUser = { email: 'foo@gmail.com', full_name: 'Foo foo' };
  //   add(orgUser);
  //   const { payload: createdUser } = find('foo@gmail.com');
  //   expect(createdUser).toMatchObject(orgUser);
  //   const orgWarnings = (createdUser as IUserDB).warning_exception;
  //   update('foo@gmail.com', { warning_exception: !orgWarnings });
  //   const { payload: updatedUser } = find('foo@gmail.com');
  //   expect(updatedUser.warning_exception).toBe(1);
  // });
});

// ======== Delete all records ==========
// const dropStmt = db.prepare(`DELETE FROM Match WHERE true`);
// dropStmt.run();
// // check that there are no more records
// const { count } = initMatchModel(db);
// expect(count()).toBe(0);
