import sqlite from 'better-sqlite3';

import { castBoolInt } from '../utils/index';
import {
  IUpdateUserArgs,
  ISqlResponse,
  IUserDB,
  IUserMatchResult,
  IAddUserArgs
} from './db.interface';

// export function initUserModel(db: sqlite): IUserTableMethods {
export function initUserModel(db: sqlite): any {
  // function createTable(): ISqlResponse {
  function createTable(): void {
    // NOTE: should I do this as a prepare() statemnt, and then execute?
    // TODO: check that having checks work!
    const query = `CREATE TABLE IF NOT EXISTS User (
      user_id INTEGER PRIMARY KEY NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      coffee_days TEXT DEFAULT 1234,
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

    db.exec(query);
  }

  function count(): number {
    const countQuery = db.prepare(`SELECT COUNT(user_id) FROM User`);

    const { 'COUNT(user_id)': numRecord } = countQuery.get();
    return numRecord;
  }

  function findUserByEmail(email: string): IUserDB {
    const findStmt = db.prepare('SELECT * FROM User WHERE email = ?');
    return findStmt.get(email);
  }

  // NOTE: would be nice to also sort via sql by the number of prevMatches
  function getUsersByCoffeeDay(
    coffeeDay: number,
    includePrevMatches: boolean = true
  ): IUserMatchResult[] {
    return [];
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

  function updateUser(targetEmail: string, opts: IUpdateUserArgs): boolean {
    // Check if the user exists
    const targetUser = findUserByEmail(targetEmail);
    if (!targetUser) {
      throw new Error(
        `No user found with email "${targetEmail}", insert first`
      );
    }

    const colVals = {
      coffee_days: opts.coffee_days || targetUser.coffee_days,
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
      coffee_days = ?,
      skip_next_match = ?,
      warning_exception = ?,
      is_active = ?,
      is_faculty = ?,
      is_alum = ?
      WHERE user_id = ?`
    );

    const queryResults = updateStmt.run(
      colVals.coffee_days,
      colVals.skip_next_match,
      colVals.warning_exceptions,
      colVals.is_active,
      colVals.is_faculty,
      colVals.is_alum,
      targetUser.user_id
    );

    // Check that you've updated at least one row
    return queryResults.changes !== 0;
  }

  // function dropTable(): ISqlResponse {
  //   try {
  //     db.exec(`DROP TABLE User`);
  //   } catch (e) {
  //     return { status: 'FAILURE', message: e };
  //   }
  //   return { status: 'SUCCESS', message: 'Dropped User table' };
  // }

  // Exposing User table methods
  return {
    createTable,
    count,
    find: findUserByEmail,
    getUsersByCoffeeDay,
    // findUserMatch: findUserWithPrevMatches,
    add: addUser,
    update: updateUser
  };
}
