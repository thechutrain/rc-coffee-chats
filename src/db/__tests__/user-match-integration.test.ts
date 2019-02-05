import sqlite from 'better-sqlite3';
import * as path from 'path';

import { initUserModel } from '../user';
import { initMatchModel } from '../match';
import { initUserMatchModel } from '../usermatch';

const DB_PATH = path.join(__dirname, 'user-match-integration-test.db');
// Global Scope:
// const usersToAdd = [
//   {
//     email: 'a@gmail.com',
//     full_name: 'a user'
//   },
//   {
//     email: 'b@gmail.com',
//     full_name: 'b user'
//   },
//   {
//     email: 'c@gmail.com',
//     full_name: 'c user'
//   },
//   {
//     email: 'd@gmail.com',
//     full_name: 'd user',
//     coffee_days: '0'
//   }
// ];

// const matchesToAdd = [
//   {
//     user_1_id: 1,
//     user_2_id: 2,
//     date: 'Monday'
//   },
//   {
//     user_1_id: 1,
//     user_2_id: 3,
//     date: 'Tuesday'
//   },
//   {
//     user_1_id: 3,
//     user_2_id: 4,
//     date: 'Monday'
//   }
// ];

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
  const { createTable: createUserTable } = initUserModel(db);
  createUserTable();

  // Create: User_Match Table
  const { createTable: createUserMatchTable } = initUserMatchModel(db);
  createUserMatchTable();

  // Create: Match Table
  const { createTable: createMatchTable } = initMatchModel(db);
  createMatchTable(db);

  db.close();
  expect(db.open).toBe(false);
});

describe('Overall db table integration test', () => {
  // it('should pass', () => {
  //   expect(true).toBe(true);
  // });

  xit('should ADD new matches for a User', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    const { createTable, _deleteRecords, count, add } = initMatchModel(db);
    createTable();
    _deleteRecords();
    expect(count()).toBe(0);

    // matchesToAdd.forEach(matchData => {
    //   add(matchData);
    // });

    // expect(count()).toBe(matchesToAdd.length);
  });

  // it('should FIND prev MATCHES of User');

  // ===== MONEY QUERY ======
  xit('should find all PREVIOUS MATCHES of a user', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    const {
      createTable,
      _deleteRecords,
      add: addMatch,
      count: countMatch
    } = initMatchModel(db);
    createTable();
    _deleteRecords();
    expect(countMatch()).toBe(0);

    // matchesToAdd.forEach(matchData => {
    //   addMatch(matchData);
    // });
    expect(countMatch()).toBe(3);

    // TODO: Check if the User_Match table is also empty here

    const { getUserPrevMatches } = initUserModel(db);
    expect(getUserPrevMatches(1, true)).toBe(false);
  });

  it('should FIND all users to match for TODAY', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });

    // Try to find Users by Matches
    const { getUsersToMatch } = initUserModel(db);
    // Only d-user for Sunday
    expect(getUsersToMatch(0)).toMatchObject([{ full_name: 'd user' }]);

    // THe other three users for Monday
    expect(getUsersToMatch(1).length).toBe(3);
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

//////////////////////////////////
// Helper Functions - scaffold Tables
//////////////////////////////////
function scaffoldUserTable(db: sqlite, userData: any[]) {
  const {
    createTable,
    _deleteRecords,
    add: addMatch,
    count: countMatch
  } = initMatchModel(db);

  createTable();
  _deleteRecords();
  if (countMatch() !== 0) {
    throw new Error('scaffolding user table, should NOT BE ANY User record');
  }

  userData.forEach(user => {
    addMatch(user);
  });

  if (countMatch() !== userData.length) {
    throw new Error('Error adding users, mismatch in nuof users trying to add');
  }
}
