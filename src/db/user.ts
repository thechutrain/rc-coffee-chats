import sqlite from 'better-sqlite3';

import { castBoolInt } from '../utils/index';
import {
  // IUpdateUserArgs,
  IUserDB,
  IUserMatchResult,
  IAddUserArgs,
  ISqlSuccess,
  ISqlError
} from './db.interface';
import { WEEKDAYS } from '../constants';

// export function initUserModel(db: sqlite): IUserTableMethods {
// NOTE: Later Optimization!
// Abstract common code out:
// - createTable
// - count
// - deleteRecords
interface IUserResult extends ISqlSuccess {
  payload?: IUserDB;
}
interface IUserModel {
  findUserByEmail: (email: string) => IUserResult | ISqlError;
}

export function initUserModel(db: sqlite): any {
  //////////////////////////////
  // Boilerplate Model Methods
  /////////////////////////////

  // function createTable(): ISqlResponse {
  function createTable(): void {
    // NOTE: should I do this as a prepare() statemnt, and then execute?
    // TODO: check that having checks work!
    const query = `CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY NOT NULL UNIQUE,
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
    const countQuery = db.prepare(`SELECT COUNT(id) FROM User`);

    const { 'COUNT(id)': numRecord } = countQuery.get();
    return numRecord;
  }

  function _deleteRecords() {
    const dropStmt = db.prepare(`DELETE FROM User WHERE true`);
    dropStmt.run();
  }

  // TODO: define fn signature on initUserModel return type
  function addUser(userVals: IAddUserArgs): ISqlSuccess | ISqlError {
    let insertSQL;
    if (userVals.coffee_days) {
      insertSQL = db.prepare(
        `INSERT INTO User (email, full_name, coffee_days) VALUES (@email, @full_name, @coffee_days)`
      );
    } else {
      insertSQL = db.prepare(
        `INSERT INTO User (email, full_name) VALUES (@email, @full_name)`
      );
    }
    let queryResult;
    try {
      queryResult = insertSQL.run(userVals);
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }

    const { changes, lastInsertROWID } = queryResult;
    return changes !== 0
      ? { status: 'SUCCESS', payload: { id: lastInsertROWID } }
      : { status: 'FAILURE', message: 'Did not create a new user' };
  }
  //////////////////////////////
  // Specific Model Methods
  /////////////////////////////
  // TODO: remove this function & clean up tests
  function find(email: string): IUserDB | null {
    const findStmt = db.prepare('SELECT * FROM User WHERE email = ?');
    const foundUser = findStmt.get(email);
    // TODO: convert the coffee_days column from 1234 --> Mon, Tues, Wed, Thurs?
    // Do that in the print message?
    return !!foundUser ? foundUser : null;
  }

  // TODO: update the function signature to match ISqlSuccess | ISqlError
  function findUserByEmail(email: string): IUserResult | ISqlError {
    const findStmt = db.prepare('SELECT * FROM User WHERE email = ?');
    let foundUser;
    let error;
    try {
      foundUser = findStmt.get(email);
      if (!foundUser) {
        throw new Error(`No email found for ${email}.`);
      }
    } catch (e) {
      error = e;
    }

    return error
      ? { status: 'FAILURE', message: error }
      : { status: 'SUCCESS', payload: foundUser };
  }

  function updateCoffeeDays(
    targetEmail: string,
    coffeeDays: WEEKDAYS[]
  ): ISqlSuccess | ISqlError {
    const { payload: foundUser } = findUserByEmail(targetEmail);

    if (!foundUser) {
      return {
        status: 'FAILURE',
        message: `No user with email "${targetEmail}" found to update`
      };
    }

    const coffeeDayStr = coffeeDays.map(day => WEEKDAYS[day]).join('');

    const updateStmt = db.prepare(
      `UPDATE User SET
        coffee_days = ?
        WHERE id = ?`
    );

    const queryResult = updateStmt.run(coffeeDayStr, foundUser.id);

    return queryResult.changes !== 0
      ? { status: 'SUCCESS', payload: coffeeDays.join(' ') }
      : { status: 'FAILURE', message: 'Did not update coffee days' };
  }

  function updateWarningExceptions(
    targetEmail: string,
    warningException: boolean
  ): ISqlSuccess | ISqlError {
    return { status: 'SUCCESS' };
  }

  function updateSkipNextMatch(
    targetEmail: string,
    warningException: boolean
  ): ISqlSuccess | ISqlError {
    return { status: 'SUCCESS' };
  }
  // function toggleSkipNextMatch(valToSet?: boolean) {}

  // function toggleWarningException(valToSet?: boolean) {}

  //////////////////////////////
  // Most Important Query!
  /////////////////////////////
  // NOTE: would be nice to also sort via sql by the number of prevMatches
  /**
   * Gets all the users to match, order by users with the most number of matches!
   * NOTE: number of matches is the absolute sum of previous matches (not matches of * other users that are being paired today)
   * TODO: fix this so we're only counting matches for other users selected today as * well
   * @param dayToMatch
   */
  function getUsersToMatch(dayToMatch?: WEEKDAYS): any {
    // ): IUserMatchResult[] {
    const coffee_day =
      dayToMatch !== undefined // Value of 0 is falsey, must check undefined
        ? WEEKDAYS[WEEKDAYS[dayToMatch]] // Pass in MON --> 1
        : new Date().getDay();

    // TODO: can use this query to get the order of Users. Who ever has the most
    // amount of previous matches goes first!
    const findMatches = db.prepare(`
      SELECT U.*, count (UM.user_id) as num_matches FROM User U
        LEFT JOIN User_Match UM
        ON U.id = UM.user_id
        LEFT JOIN Match M 
        ON UM.match_id = M.id
        WHERE U.coffee_days LIKE '%${coffee_day}%'
        AND U.skip_next_match <> 1
        GROUP BY UM.user_id
        ORDER BY num_matches desc
    `);
    // NOTE: no semicolon at the end of the string SQL or ERROR with better-sqlite3

    return findMatches.all();
  }

  // NOTE: using today's date to filter out
  // TODO: make coffeeDay default, get value later
  function getPrevMatches(
    targetUserId: number,
    includeAllMatches = false,
    coffeeDay?: number
  ) {
    let findMatches;
    if (includeAllMatches) {
      findMatches = db.prepare(`
      SELECT U.id, U.email, U.full_name, Match.date
      FROM User U
      LEFT Join User_Match
        ON U.id = User_Match.user_id
      LEFT JOIN Match
        ON User_Match.match_id = Match.id
      WHERE User_Match.user_id <> ${targetUserId}
      AND User_Match.match_id in (
        SELECT Match.id
        FROM User
        LEFT JOIN User_Match
          ON User.id = User_Match.user_id
        LEFT JOIN Match
          ON User_Match.match_id = Match.id
        WHERE User.id = ${targetUserId}
       )`);
    } else {
      //   // EXCLUDES: matches if the other user has not selected today as their day to match
      const coffeeDayInt = coffeeDay ? coffeeDay : new Date().getDay();

      findMatches = db.prepare(`
      SELECT U.id, U.email, U.full_name, Match.date
      FROM User U
      LEFT Join User_Match
        ON U.id = User_Match.user_id
      LEFT JOIN Match
        ON User_Match.match_id = Match.id
      WHERE User_Match.user_id <> 1
      AND U.coffee_days LIKE '%${coffeeDayInt}%'
      AND U.skip_next_match <> ${targetUserId}
      AND User_Match.match_id in (
        SELECT Match.id
        FROM User
        LEFT JOIN User_Match
          ON User.id = User_Match.user_id
        LEFT JOIN Match
          ON User_Match.match_id = Match.id
        WHERE User.id = ${targetUserId}
       )
      `);
    }

    return findMatches.all();
  }

  ///////////////////////
  // Main Query: MakeMatches
  //////////////////////
  function getTodaysMatches(dayToMatch?: WEEKDAYS) {
    const todaysMatches = getUsersToMatch(dayToMatch);
    // complete matches:
    const todayCompleteMatches = todaysMatches.map(userObj => {
      const { id } = userObj;
      const prevMatches = getPrevMatches(id, false, dayToMatch);
      return {
        ...userObj,
        prevMatches
      };
    });

    return todayCompleteMatches;
  }

  return {
    // Queries
    find,
    findUserByEmail,
    getUsersToMatch,
    getPrevMatches,
    getTodaysMatches,

    // Mutations
    add: addUser,
    updateCoffeeDays,
    updateSkipNextMatch,
    updateWarningExceptions,

    // Basic Table methods
    createTable,
    count,
    _deleteRecords
  };
}
