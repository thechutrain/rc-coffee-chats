import * as path from 'path';
import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { UserModel } from '../models';
import { initDB } from '../../db';

const DB_PATH = path.join(__dirname, 'test_db', 'user.db');

describe('Updated User tests:', () => {
  let DB: types.myDB;
  let User: UserModel;

  /** Test Setup
   * - don't commit any transactions into the Database
   */
  beforeAll(done => {
    DB = initDB(DB_PATH, false);
    User = DB.User;
  });

  // NOTE: can't begin multiple transactions in better sqlite!
  // This hack of not committing any records in the DB won't be able
  // to work with any update functions
  // beforeEach(done => {
  //   const begin = DB.DB_CONNECTION.prepare('BEGIN');
  //   // begin.run();
  //   done();
  // });

  // afterEach(done => {
  //   const rollback = DB.DB_CONNECTION.prepare('ROLLBACK');
  //   // rollback.run();
  //   done();
  // });

  afterAll(done => {
    DB.DB_CONNECTION.close();
    expect(DB.DB_CONNECTION.open).toBe(false);
    done();
  });

  /** Beginning of the actual Tests
   * Issues with timing out!
   */
  xit('should be able to find all the users who are planning on skipping', () => {
    const seedUsers = [
      {
        email: 'al@recurse.com',
        skipNext: true,
        days: [1, 2]
      },
      {
        email: 'b@recurse.com',
        days: [1]
      }
    ];
    for (const user of seedUsers) {
      User.add({
        email: user.email,
        full_name: 'anon'
      });
      // if (user.skipNext) {
      //   User.updateSkipNextMatch(user.email, true);
      // }
      User.updateDays(user.email, user.days);
    }

    // Tests:
    const skippers = User.usersToSkip(1);
    expect(skippers.length).toBe(1);
  });
});
