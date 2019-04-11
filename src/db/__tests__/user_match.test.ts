import * as path from 'path';
import sqlite from 'better-sqlite3';
import { UserModel, UserMatchModel, MatchModel } from '../models';

import { ALL_USERS } from './test_db/test_users';

// Creates the test database
const DB_NAME = 'user_match_test.db';
const DB_PATH = path.join(__dirname, 'test_db', DB_NAME);
let DB_CONNECTION;
let DB: { User: UserModel; Match: MatchModel; UserMatch: UserMatchModel };

beforeAll(done => {
  let didFail = false;
  let failedConnection = null;

  try {
    failedConnection = new sqlite(DB_PATH, { fileMustExist: true });
  } catch (e) {
    didFail = true;
  }
  expect(didFail).toBe(true);

  DB_CONNECTION = new sqlite(DB_PATH);
  expect(DB_CONNECTION.open).toBe(true);

  // Instantiate the User, UserMatch, Match models:
  DB = {
    User: new UserModel(DB_CONNECTION),
    Match: new MatchModel(DB_CONNECTION),
    UserMatch: new UserMatchModel(DB_CONNECTION)
  };

  done();
});

/**
 * Things my test should cover:
 * [] addMatch
 * [] find previous matches for a given user
 * [] find all the people who want to be matched for today
 *
 */
describe('Integration Test of User, UserMatch, Match Table:', () => {
  it('should be able to add in all my test users!', () => {
    let lastInsert = 1;
    ALL_USERS.forEach(user => {
      const { changes, lastInsertRowid } = DB.User.add(user);
      expect(changes).toBe(1);
      expect(lastInsertRowid).toBe(lastInsert);
      lastInsert += 1;
    });
  });

  it('should be able to find users to match for today', () => {});
});
