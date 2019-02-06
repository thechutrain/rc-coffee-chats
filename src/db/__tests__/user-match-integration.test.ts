import sqlite from 'better-sqlite3';
import * as path from 'path';

import { initUserModel } from '../user';
import { initMatchModel } from '../match';
import { initUserMatchModel } from '../usermatch';
import { IAddUserArgs, IAddMatchArgs } from '../db.interface';
import { WEEKDAYS } from '../../constants';

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
  xit('should SCAFFOLD user and match tables', () => {
    const db = new sqlite(DB_PATH, { fileMustExist: true });
    const users = [
      {
        email: 'A_@_rc.com',
        full_name: 'a test'
      },
      {
        email: 'B_@_rc.com',
        full_name: 'b test',
        coffee_days: '1'
      }
    ];
    const matches = [
      {
        user_1_id: 1,
        user_2_id: 2,
        date: '2019-01-03'
      }
    ];

    // Scaffold users table
    scaffoldUserTable(db, users);
    scaffoldMatchTable(db, matches);

    // test that scaffolding worked right:
    const {
      count: countUser,
      _deleteRecords: deleteUserRecords
    } = initUserModel(db);
    const {
      count: countMatch,
      _deleteRecords: deleteMatchRecords
    } = initMatchModel(db);
    expect(countMatch()).toBe(matches.length);
    expect(countUser()).toBe(users.length);

    deleteUserRecords();
    deleteMatchRecords();

    expect(countMatch()).toBe(0);
    expect(countUser()).toBe(0);
  });

  it('should FIND previous Matches of User', () => {
    //////////////////////////////
    // Data & Table Scaffolding
    //////////////////////////////
    const db = new sqlite(DB_PATH, { fileMustExist: true });

    const users = [
      {
        email: 'A_@_rc.com',
        full_name: 'a test'
      },
      {
        email: 'B_@_rc.com',
        full_name: 'b test',
        coffee_days: `${WEEKDAYS.MON}`
      },
      {
        email: 'C_@_rc.com',
        full_name: 'c test'
      }
    ];
    const matches = [
      {
        user_1_id: 1,
        user_2_id: 2,
        date: '2019-01-03'
      },
      {
        user_1_id: 1,
        user_2_id: 3,
        date: '2019-01-04'
      }
    ];

    // Scaffold users table
    scaffoldUserTable(db, users);
    scaffoldMatchTable(db, matches);

    //////////////////////////////
    // Testing
    //////////////////////////////
    const { getPrevMatches } = initUserModel(db);
    const prevMatches_user1_monday = getPrevMatches(1, false, WEEKDAYS.MON);

    expect(prevMatches_user1_monday).toMatchObject([
      { full_name: 'b test' },
      { full_name: 'c test' }
    ]);

    const prevMatches_user1_tuesday = getPrevMatches(1, false, WEEKDAYS.TUE);
    expect(prevMatches_user1_tuesday).toMatchObject([{ full_name: 'c test' }]);

    const prevMatches_user1_tuesday_all = getPrevMatches(1, true, WEEKDAYS.TUE);
    expect(prevMatches_user1_monday).toMatchObject([
      { full_name: 'b test' },
      { full_name: 'c test' }
    ]);
  });

  // xit('should FIND all users to match for TODAY', () => {
  //   const db = new sqlite(DB_PATH, { fileMustExist: true });

  //   // Try to find Users by Matches
  //   const { getUsersToMatch } = initUserModel(db);
  //   // Only d-user for Sunday
  //   expect(getUsersToMatch(0)).toMatchObject([{ full_name: 'd user' }]);

  //   // THe other three users for Monday
  //   expect(getUsersToMatch(1).length).toBe(3);
  // });

  it('should FIND all users to match for GIVEN DAY', () => {
    //////////////////////////////
    // Data & Table Scaffolding
    //////////////////////////////
    const db = new sqlite(DB_PATH, { fileMustExist: true });

    const users = [
      {
        email: 'A_@_rc.com',
        full_name: 'a test'
      },
      {
        email: 'B_@_rc.com',
        full_name: 'b test',
        coffee_days: `${WEEKDAYS.MON}`
      },
      {
        email: 'C_@_rc.com',
        full_name: 'c test'
      },
      {
        email: 'D_@_rc.com',
        full_name: 'd test'
      }
    ];
    const matches = [
      {
        user_1_id: 1,
        user_2_id: 2,
        date: '2019-01-03'
      },
      {
        user_1_id: 1,
        user_2_id: 3,
        date: '2019-01-04'
      }
    ];

    // Scaffold users table
    scaffoldUserTable(db, users);
    scaffoldMatchTable(db, matches);

    //////////////////////////////
    // Testing
    //////////////////////////////
    const { getUsersToMatch } = initUserModel(db);
    const mondayMatches = getUsersToMatch(WEEKDAYS.MON);

    expect(mondayMatches).toMatchObject([
      { full_name: 'a test', num_matches: 2 },
      { full_name: 'b test', num_matches: 1 },
      { full_name: 'c test', num_matches: 1 },
      { full_name: 'd test', num_matches: 0 }
    ]);

    const sundayMatches = getUsersToMatch(WEEKDAYS.SUN);
    expect(sundayMatches).toMatchObject([]);

    const tuesdayMatches = getUsersToMatch(WEEKDAYS.TUE);
    expect(tuesdayMatches).toMatchObject([
      { full_name: 'a test' },
      { full_name: 'c test' },
      { full_name: 'd test' }
    ]);

    // TODO: check if its excluding users who have skipped matches
  });

  // MOST IMPORTANT TEST:
  it('should get TODAYS matches and their PREVIOUS MATCHES', () => {
    //////////////////////////////
    // Data & Table Scaffolding
    //////////////////////////////
    const db = new sqlite(DB_PATH, { fileMustExist: true });

    const users = [
      {
        email: 'A_@_rc.com',
        full_name: 'a test'
      },
      {
        email: 'B_@_rc.com',
        full_name: 'b test',
        coffee_days: `${WEEKDAYS.MON}`
      },
      {
        email: 'C_@_rc.com',
        full_name: 'c test'
      },
      {
        email: 'D_@_rc.com',
        full_name: 'd test'
      },
      {
        email: 'E_@_rc.com',
        full_name: 'e test'
      }
    ];
    const matches = [
      {
        user_1_id: 1,
        user_2_id: 2,
        date: '2019-01-03'
      },
      {
        user_1_id: 1,
        user_2_id: 3,
        date: '2019-01-04'
      },
      {
        user_1_id: 1,
        user_2_id: 4,
        date: '2019-01-05'
      },
      {
        user_1_id: 2,
        user_2_id: 4,
        date: '2019-01-06'
      }
    ];

    // Scaffold users table
    scaffoldUserTable(db, users);
    scaffoldMatchTable(db, matches);

    //////////////////////////////
    // Testing
    //////////////////////////////
    const { getTodaysMatches } = initUserModel(db);
    const mondayMatches = getTodaysMatches(WEEKDAYS.MON);

    expect(mondayMatches).toMatchObject([
      {
        full_name: 'a test',
        num_matches: 3
      },
      {
        full_name: 'b test',
        num_matches: 2
      },
      {
        full_name: 'd test',
        num_matches: 2
      },
      {
        full_name: 'c test',
        num_matches: 1
      },
      {
        full_name: 'e test',
        num_matches: 0
      }
    ]);

    // TODO: check if its excluding users who have skipped matches
  });
});

//////////////////////////////////
// Helper Functions - scaffold Tables
//////////////////////////////////
function scaffoldUserTable(db: sqlite, userData: IAddUserArgs[]) {
  const {
    createTable,
    _deleteRecords,
    add: addUser,
    count: countUser
  } = initUserModel(db);

  createTable();
  _deleteRecords();
  if (countUser() !== 0) {
    throw new Error('scaffolding user table, should NOT BE ANY User record');
  }

  userData.forEach(user => {
    addUser(user);
  });

  if (countUser() !== userData.length) {
    throw new Error('Error adding users, mismatch in nuof users trying to add');
  }
}

function scaffoldMatchTable(db: sqlite, matchData: IAddMatchArgs[]) {
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

  matchData.forEach(user => {
    addMatch(user);
  });

  if (countMatch() !== matchData.length) {
    throw new Error('Error adding users, mismatch in nuof users trying to add');
  }
}
