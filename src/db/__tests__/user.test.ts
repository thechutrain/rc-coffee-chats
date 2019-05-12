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

  beforeEach(done => {
    const begin = DB.DB_CONNECTION.prepare('BEGIN');
    begin.run();
    done();
  });

  afterEach(done => {
    const rollback = DB.DB_CONNECTION.prepare('ROLLBACK');
    rollback.run();
    done();
  });

  afterAll(done => {
    DB.DB_CONNECTION.close();
    expect(DB.DB_CONNECTION.open).toBe(false);
    done();
  });

  /** Beginning of the actual Tests
   *
   */
  xit('should be able to find all the users who are planning on skipping', () => {
    const skippers = User.usersToSkip(1);
    expect(skippers).toBe(false);
  });
});
