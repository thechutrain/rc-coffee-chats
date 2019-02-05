import sqlite from 'better-sqlite3';
import * as path from 'path';

import { initUserModel } from '../user';
import { initMatchModel } from '../match';
import { initUserMatchModel } from '../usermatch';

const DB_PATH = path.join(__dirname, 'user-match-integration-test.db');
// Global Scope:
let userTable; // obj containaing: k->primary key, v-> single userToAdd obj
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

const matchesToAdd = [
  {
    user_1_id: 1,
    user_2_id: 2,
    date: 'DAY 1'
  },
  {
    user_1_id: 1,
    user_2_id: 2,
    date: 'DAY 2'
  },
  {
    user_1_id: 1,
    user_2_id: 3,
    date: 'DAY 2'
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
  const { count: countUsers } = initUserModel(db);
  expect(countUsers()).toBe(usersToAdd.length);

  // Create: User_Match Table
  const { createTable: createUserMatchTable } = initUserMatchModel(db);
  createUserMatchTable();

  // Create: Match Table
  createMatchTable(db);
  // const { count: countMatches } = initMatchModel(db);
  // expect(countMatches()).toBe(matchesToAdd.length);

  db.close();
  expect(db.open).toBe(false);
});

describe('Overall db table integration test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
  // it('should be able to find all the previous matches that a User had', () => {
  //   const db = new sqlite(DB_PATH, { fileMustExist: true });
  //   expect(db.open).toBe(true);

  //   const { getUsersByCoffeeDay } = initUserModel(db);
  //   const userSearchResult = getUsersByCoffeeDay(1);

  //   expect(userSearchResult.length).toBe(usersToAdd.length);
  //   userSearchResult.forEach(userResult => {
  //     expect(userResult).toHaveProperty('prevMatches');
  //   });
  // });
});

// ===== helper function to create User table =====
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

function createMatchTable(db: sqlite) {
  const { createTable, add } = initMatchModel(db);
  createTable();

  //// ====== version 1 ===========
  const matchMap = {};
  matchesToAdd.forEach(match => {
    const { message } = add(match);
    if (message) {
      console.log(message);
      throw new Error('Error adding matches from initMatchTable()');
    }
    // matchMap[payload.lastInsertROWID] = match;
  });

  return Object.freeze(matchMap);
}
