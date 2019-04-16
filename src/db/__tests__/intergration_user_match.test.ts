import * as path from 'path';
import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { WEEKDAY } from '../../types';
import { ALL_USERS, MATCHES } from './test_db/mock_data';
import { initDB } from '../index';

const DB_PATH = path.join(__dirname, 'test_db', 'today_users_prevmatches.db');
let DB: types.myDB;

describe('User-UserMatch-Match tests:', () => {
  it('Should be able to add in a bunch of users and their matches', () => {
    ALL_USERS.forEach(user => {
      DB.User.add(user);
    });

    const count = DB.User.count();

    expect(count).toBe(ALL_USERS.length);
  });

  it('should be able to create matches of users', () => {
    MATCHES.forEach(match => {
      DB.UserMatch.addNewMatch(match.user_ids, match.inputDate);
    });

    expect(DB.UserMatch.count()).toBe(MATCHES.length * 2);
    expect(DB.Match.count()).toBe(MATCHES.length);
  });

  it('should find all the previous matches of a given user', () => {
    const user_a = ALL_USERS[0];
    const results = DB.User.findPrevActiveMatches(1, 1);

    expect(results.length).toBe(2);
  });

  it('should not get any users who are inactive or were planning on skipping today', () => {
    const usersToMatchMonday = DB.User.findMatchesByDay(1); // Find matches for monday

    /**
     * Everyone in the UsersToMatch:
     *  is_active = 1;
     *  skip_next_match = 0;
     *  coffeeDays=has to have 1
     */
    usersToMatchMonday.forEach(user => {
      expect(user.is_active).toBe(1);
      expect(user.skip_next_match).toBe(0);
      const coffeeDays = user.coffee_days.split('');
      expect(coffeeDays.indexOf('1')).not.toBe(-1);
    });

    expect(usersToMatchMonday.length).toBe(3);
  });
});

// ==== PREP ====
beforeAll(done => {
  let failedConnection = null;
  let didFail = false;
  try {
    failedConnection = initDB(DB_PATH, true);
  } catch (e) {
    didFail = true;
  }
  expect(didFail).toBe(true);

  // creates new DB
  DB = initDB(DB_PATH, false);
  expect(DB.DB_CONNECTION.open).toBe(true);

  done();
});

afterAll(done => {
  DB.DB_CONNECTION.close();
  expect(DB.DB_CONNECTION.open).toBe(false);

  done();
});
