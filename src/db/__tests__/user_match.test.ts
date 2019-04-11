import * as path from 'path';
import sqlite from 'better-sqlite3';
import { UserModel, UserMatchModel, MatchModel } from '../models';

import { ALL_USERS, MATCHES } from './test_db/mock_user_data';

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
  const User = new UserModel(DB_CONNECTION);
  const Match = new MatchModel(DB_CONNECTION);
  const UserMatch = new UserMatchModel(DB_CONNECTION, User, Match);
  DB = {
    User,
    Match,
    UserMatch
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

    expect(DB.User.count()).toBe(ALL_USERS.length);
  });

  it('should be able to create matches of users', () => {
    expect(DB.Match.count()).toBe(0);
    expect(DB.UserMatch.count()).toBe(0);

    MATCHES.forEach(match_pair => {
      DB.UserMatch.addNewMatch(match_pair);
    });

    expect(DB.Match.count()).toBe(MATCHES.length);
  });

  // it('should be able to find users to match for today', () => {});
});
