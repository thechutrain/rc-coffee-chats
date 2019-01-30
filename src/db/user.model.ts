import sqlite from 'better-sqlite3';
import { ISqlResponse } from './index';

interface IAddUserArgs {
  email: string;
  full_name: string;
}

interface IUpdateUserArgs {
  warning_exceptions?: boolean;
  skip_next_match?: boolean;
  // ==== Admin features? ===
  // in_session?: boolean,
  // is_alumn?: boolean
}

type truthy = boolean | number;
interface IUserDB {
  user_id: number;
  email: string;
  full_name: string;
  is_faculty: truthy;
  is_alumn: truthy;
  is_active: truthy; // Whether they will get any matches or not
  in_session: truthy; // Will Deprecate Later
  warning_exceptions: truthy;
  skip_next_match: truthy;
}

interface IUserSqlResponse extends ISqlResponse {
  payload?: IUserDB | IUserDB[];
}
export interface IUserTableMethods {
  // _dropTable: () => ISqlResponse;
  createTable: () => ISqlResponse; // can I make this chainable?
  count: () => number;
  find: (email: string) => IUserSqlResponse;
  add: (IAddUserArgs) => ISqlResponse;
  // update: (email: string, opts: IUpdateUserArgs) => ISqlResponse;
}

export function initUserModel(db: sqlite): IUserTableMethods {
  return {
    createTable: initCreateUserTable(db),
    // _dropTable: initDropUserTable(db), // admin priviledges
    // remove: initRemoveUser(db) // Admin privileges
    count: initCountUsers(db),
    find: initFindUser(db),
    add: initAddUser(db)
    // update: initUpdateUser(db)
  };
}

export function initCreateUserTable(db: sqlite): () => ISqlResponse {
  return () => {
    // NOTE: should I do this as a prepare() statemnt, and then execute?
    // TODO: check that having checks work!
    const query = `CREATE TABLE IF NOT EXISTS User (
      user_id INTEGER NOT NULL UNIQUE PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      is_alum INTEGER DEFAULT 0,
      is_faculty INTEGER DEFAULT 0,
      is_at_rc INTERGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      skip_next_match INTEGER DEFAULT 0,
      warning_exception INTEGER DEFAULT 0,
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
  };
}

export function initCountUsers(db: sqlite): () => number {
  return () => {
    const stmt = db.prepare('SELECT * FROM User');
    return stmt.all().length;
  };
}

export function initFindUser(db: sqlite): (email: string) => IUserSqlResponse {
  return (email: string) => {
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
  };
}

export function initAddUser(db: sqlite) {
  // (userVals: IAddUserArgs): void;
  // (userVals: IAddUserArgs[]): void ;
  // TODO: add flexibility in receiving an array or single UserArg
  return (userVals: IAddUserArgs): ISqlResponse => {
    const insertSQL = db.prepare(
      `INSERT INTO User (email, full_name) VALUES (@email, @full_name)`
    );
    try {
      insertSQL.run(userVals);
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }
    return { status: 'SUCCESS' };
  };
}

// export function initUpdateUser(db: sqlite): () => ISqlResponse {}

// Note: used for testing
export function initDropUserTable(db: sqlite): () => ISqlResponse {
  return () => {
    try {
      db.exec(`DROP TABLE User`);
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }
    return { status: 'SUCCESS', message: 'Dropped User table' };
  };
}
// function for updating a user's configs
// input: email or primary_key? + opts{is_alumn: true, is_active: true, is_faculty: false}
// output: updated user object

// function for finding a single user
// input: { email: asdfa }

// function for finding many users that fit a criteria
