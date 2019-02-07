// import * as rimraf from 'rimraf';
import * as path from 'path';
import { initMatchModel } from '../match';
import { initUserModel } from '../user';
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
  let error = null;
  try {
    createTable();
  } catch (e) {
    error = e;
  }
  expect(error).toBeNull();
  expect(count()).toBe(0);

  db.close();
  expect(db.open).toBe(false);
});

xdescribe('Match Model test', () => {
  // it('should pass', () => {
  //   expect(true).toBe(true);
  // });

  it('should INSERT a new match', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { add, count, _deleteRecords } = initMatchModel(db);
    _deleteRecords();
    expect(count()).toBe(0);

    const { status } = add({
      user_1_id: 1,
      user_2_id: 2
    });
    expect(status).toBe('OK');

    expect(count()).toBe(1);
  });

  it('should INSERT many matches for SINGLE user', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { add, count, _deleteRecords } = initMatchModel(db);
    _deleteRecords();
    expect(count()).toBe(0);

    const { status: status1 } = add({
      user_1_id: 1,
      user_2_id: 2,
      date: '2019-01-31'
    });
    expect(status1).toBe('OK');

    const { status: status2 } = add({
      user_1_id: 1,
      user_2_id: 2,
      date: '2019-02-31'
    });

    expect(status2).toBe('OK');

    expect(count()).toBe(2);
  });

  it('should FIND record in Match', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    expect(db.open).toBe(true);

    const { add, count, find, _deleteRecords } = initMatchModel(db);
    _deleteRecords();
    expect(count()).toBe(0);

    const matchRecord1 = {
      user_1_id: 1,
      user_2_id: 2,
      date: '2019-01-31'
    };
    const { status: status1 } = add(matchRecord1);
    expect(status1).toBe('OK');

    const foundMatches = find(1);

    expect(foundMatches).toMatchObject([matchRecord1]);
  });

  // it('should be able to add multiple matches on different days', () => {
  //   const db = new sqlite(DB_PATH, { fileMustExist: true });
  //   expect(db.open).toBe(true);
  //   const { add, count } = initMatchModel(db);

  //   expect(count()).toBe(0);
  //   add({ user_1_id: 1, user_2_id: 2, date: '2019-01-31' });
  //   expect(count()).toBe(1);
  //   add({ user_1_id: 1, user_2_id: 2, date: '2019-01-30' });
  //   expect(count()).toBe(2);
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
  //   expect(findResult.status).toBe('OK');
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
    if (status === 'ERROR') {
      throw new Error('Error adding users from initUserTable()');
    }
    userMap[payload.lastInsertROWID] = user;
  });

  return Object.freeze(userMap);
}

////////////////////////
// Old Jest Hooks
////////////////////////

// afterEach(() => {
//   const db = new sqlite(DB_PATH, { fileMustExist: true });
//   expect(db.open).toBe(true);

//   // Delete all records
//   const dropStmt = db.prepare(`DELETE FROM Match WHERE true`);
//   dropStmt.run();

//   // check that there are no more records
//   const { count } = initUserModel(db);
//   expect(count()).toBe(usersToAdd.length);
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
