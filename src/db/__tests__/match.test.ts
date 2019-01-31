// import * as rimraf from 'rimraf';
import * as path from 'path';
import { initMatchModel } from '../match/match';
import { initUserModel } from '../user/user';
import sqlite from 'better-sqlite3';

const DB_PATH = path.join(__dirname, 'match-test.db');

// Global Scope:
let userTable;
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

beforeAll(() => {
  // Ensures that creating brand new .db file
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

  // !IMPORTANT: need to create User table first!
  userTable = createUserTable(db);

  // create Match table
  const { createTable, count } = initMatchModel(db);
  const { status, message } = createTable();
  // expect(count()).toBe(0);
  expect(message).toBeUndefined();
  expect(status).toBe('SUCCESS');

  db.close();
  expect(db.open).toBe(false);
});

afterEach(() => {
  const db = new sqlite(DB_PATH, { fileMustExist: true });
  expect(db.open).toBe(true);

  // Delete all records
  const dropStmt = db.prepare(`DELETE FROM Match WHERE true`);
  dropStmt.run();

  // check that there are no more records
  const { count } = initUserModel(db);
  expect(count()).toBe(usersToAdd.length);
});

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
  it('should pass', () => {
    expect(true).toBe(true);
  });
  // === CREATE table query
  it('should be able to create an empty table', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { createTable, count } = initMatchModel(db);
    createTable();
    const numUsers = count();
    expect(numUsers).toBe(0);
    const response = createTable();
    expect(response.status).toBe('SUCCESS');
    db.close();
  });

  it('should not be able to find any matches in an empty Match Table', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);
    const { find } = initMatchModel(db);
    const { payload: matchesUser1, status, message } = find(1);
    expect(message).not.toBeDefined();
    expect(status).toBe('SUCCESS');
    expect(matchesUser1).toEqual([]);
  });

  it('should be able to create a new match', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { add, count } = initMatchModel(db);
    expect(count()).toBe(0);
    const { status } = add({
      user_1_id: 1,
      user_2_id: 2
    });
    expect(status).toBe('SUCCESS');

    expect(count()).toBe(1);
  });

  it('should be able to create a multiple matches of same users', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { add, count } = initMatchModel(db);
    expect(count()).toBe(0);
    const { status: status1 } = add({
      user_1_id: 1,
      user_2_id: 2,
      date: '2019-01-31'
    });
    expect(status1).toBe('SUCCESS');

    const { status: status2 } = add({
      user_1_id: 1,
      user_2_id: 2,
      date: '2019-02-31'
    });

    expect(status2).toBe('SUCCESS');

    expect(count()).toBe(2);
  });

  // // === INSERT queries ===
  it('should be able to find a single match to the Match table', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { add, count, find } = initMatchModel(db);

    expect(count()).toBe(0);

    const matchRecord1 = {
      user_1_id: 1,
      user_2_id: 2,
      date: '2019-01-31'
    };
    const { status: status1 } = add(matchRecord1);
    expect(status1).toBe('SUCCESS');

    const { payload: matchesUser1, status, message } = find(1);

    expect(message).not.toBeDefined();
    expect(status).toBe('SUCCESS');
    expect(matchesUser1).toMatchObject([matchRecord1]);
  });

  it('should be able to add multiple matches on different days', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);
    const { add, count } = initMatchModel(db);

    expect(count()).toBe(0);
    add({ user_1_id: 1, user_2_id: 2, date: '2019-01-31' });
    expect(count()).toBe(1);
    add({ user_1_id: 1, user_2_id: 2, date: '2019-01-30' });
    expect(count()).toBe(2);
  });

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
// helper function to create User table
function createUserTable(db: sqlite) {
  const { createTable, add } = initUserModel(db);
  createTable();

  const userMap = {};
  usersToAdd.forEach(user => {
    const { status, payload } = add(user);
    if (status === 'FAILURE') {
      throw new Error('Error adding users from initUserTable()');
    }
    userMap[payload.lastInsertROWID] = user;
  });

  return Object.freeze(userMap);
}
