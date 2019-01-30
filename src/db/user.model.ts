import sqlite from 'better-sqlite3';
import { ISqlResponse } from './index';
import { castBoolInt } from '../utils/index';

interface IAddUserArgs {
  email: string;
  full_name: string;
}

interface IUpdateUserArgs {
  skip_next_match?: boolean;
  warning_exception?: boolean;
  // ==== Admin features? ===
  is_active?: boolean;
  is_faculty?: boolean;
  is_at_rc?: boolean;
  is_alum?: boolean;
}

type truthy = boolean | number;
export interface IUserDB {
  user_id: number;
  email: string;
  full_name: string;
  skip_next_match: truthy;
  warning_exception: truthy;
  is_active: truthy; // Whether they will get any matches or not
  is_faculty: truthy;
  is_alum: truthy;
  // is_admin: truthy; // admin has ability to change other user settings & view logs
  // in_session: truthy; // Will Deprecate Later
}

interface IUserSqlResponse extends ISqlResponse {
  payload?: IUserDB;
}
interface IUsersSqlResponse extends ISqlResponse {
  payload?: IUserDB[];
}
export interface IUserTableMethods {
  // _dropTable: () => ISqlResponse;
  createTable: () => ISqlResponse; // can I make this chainable?
  count: () => number;
  find: (email: string) => IUserSqlResponse;
  add: (IAddUserArgs) => ISqlResponse;
  update: (targetEmail: string, opts: IUpdateUserArgs) => IUserSqlResponse;
}

export function initUserModel(db: sqlite): IUserTableMethods {
  function createTable(): ISqlResponse {
    // NOTE: should I do this as a prepare() statemnt, and then execute?
    // TODO: check that having checks work!
    const query = `CREATE TABLE IF NOT EXISTS User (
      user_id INTEGER NOT NULL UNIQUE PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      skip_next_match INTEGER DEFAULT 0,
      warning_exception INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      is_faculty INTEGER DEFAULT 0,
      is_alum INTEGER DEFAULT 0,
      CHECK (is_alum in (0,1)),
      CHECK (is_faculty in (0,1)),
      CHECK (is_active in (0,1)),
      CHECK (skip_next_match in (0,1)),
      CHECK (warning_exception in (0,1))
    )`;

    try {
      db.exec(query);
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }
    return { status: 'SUCCESS' };
  }

  function count(): number {
    const stmt = db.prepare('SELECT * FROM User');
    return stmt.all().length;
  }

  function findUserByEmail(email: string): IUserSqlResponse {
    const findStmt = db.prepare('SELECT * FROM User WHERE email = ?');
    try {
      const user = findStmt.get(email);
      return {
        status: 'SUCCESS',
        payload: user
      };
    } catch (e) {
      return {
        status: 'FAILURE',
        message: e
      };
    }
  }

  function addUser(userVals: IAddUserArgs): ISqlResponse {
    const insertSQL = db.prepare(
      `INSERT INTO User (email, full_name) VALUES (@email, @full_name)`
    );
    let newUser;
    try {
      newUser = insertSQL.run(userVals);
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }
    return { status: 'SUCCESS', payload: newUser };
  }

  function updateUser(
    targetEmail: string,
    opts: IUpdateUserArgs
  ): IUserSqlResponse {
    // Check if the user exists
    const { payload: targetUser } = findUserByEmail(targetEmail);
    if (!targetUser) {
      return {
        status: 'FAILURE',
        message: `No user found with email "${targetEmail}". Could not update User`
      };
    }

    // Created updated User in memory
    let updatedUser;
    const colVals = {
      skip_next_match: castBoolInt(
        opts.skip_next_match || targetUser.skip_next_match
      ),
      warning_exceptions: castBoolInt(
        opts.warning_exception || targetUser.warning_exception
      ),
      is_active: castBoolInt(opts.is_active || targetUser.is_active),
      is_faculty: castBoolInt(opts.is_faculty || targetUser.is_faculty),
      is_alum: castBoolInt(opts.is_alum || targetUser.is_alum)
    };
    const updateStmt = db.prepare(
      `UPDATE User SET 
      skip_next_match = ?,
      warning_exception = ?,
      is_active = ?,
      is_faculty = ?,
      is_alum = ?
      WHERE user_id = ?`
    );

    try {
      updatedUser = updateStmt.run(
        colVals.skip_next_match,
        colVals.warning_exceptions,
        colVals.is_active,
        colVals.is_faculty,
        colVals.is_alum,
        targetUser.user_id
      );
    } catch (e) {
      return {
        status: 'FAILURE',
        message: e
      };
    }

    return {
      status: 'SUCCESS',
      payload: updatedUser
    };
  }

  function dropTable(): ISqlResponse {
    try {
      db.exec(`DROP TABLE User`);
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }
    return { status: 'SUCCESS', message: 'Dropped User table' };
  }

  // Exposing User table methods
  return {
    createTable,
    count,
    find: findUserByEmail,
    add: addUser,
    update: updateUser
  };
}
