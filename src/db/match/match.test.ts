// import * as rimraf from 'rimraf';
import * as path from 'path';
import { initMatchModel } from './match';
import { initUserModel } from '../user/user';
import sqlite from 'better-sqlite3';

const DB_PATH = path.join(__dirname, 'match-test.db');

// Global Scope:
let userTable;

function initUserTable(db: sqlite) {
  // const dbPath = path.join(__dirname, DB_FILE_NAME);
  // const db = new sqlite(dbPath);
  const { createTable, add } = initUserModel(db);
  // createTable();

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
  console.log(userTable);
}

// function resetMatch() {
//   const dbPath = path.join(__dirname, DB_FILE_NAME);
//   return new Promise((resolve, reject) => {
//     rimraf(dbPath, {}, err => {
//       if (err) {
//         reject(err);
//       }
//       expect(err).not.toBeDefined();
//       const db = new sqlite(dbPath);
//       // Create a user's table
//       initUserTable(db);
//       const numUsers = Object.keys(userTable).length;
//       expect(numUsers).toBe(4);
//       resolve();
//     });
//   });
// }

beforeAll(async () => {
  // Ensures that creating brand new .db file
  let failedConnection = false;
  try {
    // tslint:disable-next-line
    new sqlite(DB_PATH, { fileMustExist: true });
  } catch (e) {
    failedConnection = true;
  }
  expect(failedConnection).toBe(true);

  const db = new sqlite(DB_PATH); // creates DB
  expect(db.open).toBe(true);

  // === create Match table ===
  // const { createTable } = initMatchModel(db);
  // const SqlResponse = createTable();
  // expect(SqlResponse.message).toBeNull();
  // expect(SqlResponse.status).toBe('SUCCESS');

  // db.close();
  // expect(db.open).toBe(false);
});

// afterEach(() => {
//   const db = new sqlite(DB_PATH, { fileMustExist: true });
//   expect(db.open).toBe(true);

//   // Delete all records
//   const dropStmt = db.prepare(`DELETE FROM Match WHERE true`);
//   dropStmt.run();

//   // check that there are no more records
//   const { count } = initUserModel(db);
//   expect(count()).toBe(0);
// });

// afterAll(() => {
//   const dbPath = path.join(__dirname, DB_FILE_NAME);
//   const db = new sqlite(dbPath);
//   expect(db).toBeDefined();
//   // Drop the table?
//   db.close();
// });

// beforeEach(() => {
//   const db = new sqlite(DB_PATH, { fileMustExist: true });
//   expect(db.open).toBe(true);
//   db.close();
//   expect(db.open).toBe(false);
// });

describe('User Model test', () => {
  // it('should pass', () => {
  //   expect(true).toBe(true);
  // });
  // === CREATE table query
  // it('should be able to create an empty table', () => {
  //   const db = new sqlite(DB_PATH, { fileMustExist: true });
  //   expect(db.open).toBe(true);
  //   const { createTable, count } = initMatchModel(db);
  //   createTable();
  //   const numUsers = count();
  //   expect(numUsers).toBe(0);
  //   const response = createTable();
  //   expect(response.status).toBe('SUCCESS');
  //   db.close();
  // });
  // it('should not be able to find any matches in an empty Match Table', () => {
  //   const dbPath = path.join(__dirname, DB_FILE_NAME);
  //   const db = new sqlite(dbPath);
  //   expect(db).toBeDefined();
  //   const { count, find } = initMatchModel(db);
  //   expect(count()).toBe(0);
  //   const { payload: matchesUser1, status, message } = find(1);
  //   expect(message).not.toBeDefined();
  //   expect(status).toBe('SUCCESS');
  //   expect(matchesUser1).toEqual([]);
  // });
  // it('should not recreate table if a table has been created already', () => {
  //   const dbPath = path.join(__dirname, DB_FILE_NAME);
  //   const db = new sqlite(dbPath);
  //   expect(db).toBeDefined();
  //   const { add, count, createTable } = initMatchModel(db);
  //   expect(count()).toBe(0);
  //   add(1, 2);
  //   expect(count()).toBe(1);
  //   createTable();
  //   // expect(count()).toBe(1);
  // });
  // // === INSERT queries ===
  // it('should be able to add a single match to the Match table', () => {
  //   const dbPath = path.join(__dirname, DB_FILE_NAME);
  //   const db = new sqlite(dbPath);
  //   expect(db).toBeDefined();
  //   const { add, count, find } = initMatchModel(db);
  //   expect(count()).toBe(0);
  //   const { payload: matchesUser1, status, message } = find(1);
  //   expect(message).not.toBeDefined();
  //   expect(status).toBe('SUCCESS');
  //   expect(matchesUser1).toEqual([]);
  // });
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
