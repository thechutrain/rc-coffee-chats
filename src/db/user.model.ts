import Database from 'better-sqlite3';
import { ISqlResponse } from './index';

export interface IUserTableMethods {
  createTable: () => ISqlResponse; // can I make this chainable?
  add: (IAddUserArgs) => ISqlResponse;
}

interface IAddUserArgs {
  email: string;
  full_name: string;
}

export function initUserModel(db: Database): IUserTableMethods {
  return {
    createTable: initCreateUserTable(db),
    add: initAddUserTable(db)
  };
}

function initCreateUserTable(db: Database): () => ISqlResponse {
  return () => {
    // NOTE: should I do this as a prepare() statemnt, and then execute?
    // TODO: check that having checks work!
    const createUserTableSql = `CREATE TABLE IF NOT EXISTS User (
      user_id INTEGER NOT NULL UNIQUE PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      is_alumn INTEGER DEFAULT 0,
      is_faculty INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      skip_next_match INTEGER DEFAULT 0,
      warning_exception INTEGER DEFAULT 0,
      CHECK (is_alumn in (0,1)),
      CHECK (is_faculty in (0,1)),
      CHECK (is_active in (0,1)),
      CHECK (skip_next_match in (0,1)),
      CHECK (warning_exception in (0,1))
    )`;
    try {
      db.exec(createUserTableSql);
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }
    return { status: 'SUCCESS' };
  };
}

function initAddUserTable(db: Database) {
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

// function for updating a user's configs
// input: email or primary_key? + opts{is_alumn: true, is_active: true, is_faculty: false}
// output: updated user object

// function for finding a single user
// input: { email: asdfa }

// function for finding many users that fit a criteria
