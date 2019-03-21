import sqlite from 'better-sqlite3';

import { castBoolInt } from '../utils/index';
import {
  // IUpdateUserArgs,
  IUserDB,
  IUserMatchResult,
  IAddUserArgs,
  ISqlOk,
  ISqlError
} from './db.interface';
import { WEEKDAYS } from '../constants';

// export function initUserModel(db: sqlite): IUserTableMethods {
// NOTE: Later Optimization!
// Abstract common code out:
// - createTable
// - count
// - deleteRecords
interface IUserResult extends ISqlOk {
  payload?: IUserDB;
}
interface IUserModel {
  findUserByEmail: (email: string) => IUserResult | ISqlError;
}

export function initUserModel(db: sqlite) {
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

  //////////////////////////////
  // Insertions
  /////////////////////////////
  // TODO: define fn signature on initUserModel return type
  function addUser(userVals: IAddUserArgs): ISqlOk | ISqlError {
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
      console.log('About to try to run query ....');
      queryResult = insertSQL.run(userVals);
    } catch (e) {
      return { status: 'ERROR', message: e };
    }

    const { changes, lastInsertROWID } = queryResult;
    return changes !== 0
      ? { status: 'OK', payload: { id: lastInsertROWID } }
      : { status: 'ERROR', message: 'Did not create a new user' };
  }

  /////////////////////////////
  // Find & Get column vals
  /////////////////////////////
  // TODO: remove this function & clean up tests

  function find(email: string): IUserDB | null {
    const findStmt = db.prepare('SELECT * FROM User WHERE email = ?');
    const foundUser = findStmt.get(email);
    // TODO: convert the coffee_days column from 1234 --> Mon, Tues, Wed, Thurs?
    // Do that in the print message?
    return !!foundUser ? foundUser : null;
  }

  // TODO: update the function signature to match ISqlOk | ISqlError
  function findUserByEmail(email: string): ISqlOk | ISqlError {
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
      ? { status: 'ERROR', message: error }
      : { status: 'OK', payload: foundUser };
  }

  // function getCoffeeDays(targetEmail: string): ISqlOk | ISqlError {
  //   const { payload: foundUser } = findUserByEmail(targetEmail);

  //   if (!foundUser) {
  //     return {
  //       status: 'ERROR',
  //       message: `No user with email "${targetEmail}" found to update`
  //     };
  //   } else {
  //     return {
  //       status: 'OK',
  //       payload: {
  //         coffeeDays: foundUser.coffee_days.split('').map(day => WEEKDAYS[day])
  //       }
  //     };
  //   }
  // }

  // TODO: add format option (raw) or as a string
  function getCoffeeDays(targetEmail: string): { coffeeDays: string[] } {
    const { payload: foundUser } = findUserByEmail(targetEmail);

    if (!foundUser) {
      throw new Error(`No user with email "${targetEmail}" found to update`);
    } else {
      return {
        coffeeDays: foundUser.coffee_days.split('').map(day => WEEKDAYS[day])
      };
    }
  }

  function getWarningStatus(targetEmail: string): ISqlOk | ISqlError {
    const { payload: foundUser } = findUserByEmail(targetEmail);

    if (!foundUser) {
      return {
        status: 'ERROR',
        message: `No user with email "${targetEmail}" found to update`
      };
    } else {
      return {
        status: 'OK',
        payload: {
          warningException: foundUser.warning_exception ? true : false
        }
      };
    }
  }

  function getNextStatus(targetEmail: string): ISqlOk | ISqlError {
    const { payload: foundUser } = findUserByEmail(targetEmail);

    if (!foundUser) {
      return {
        status: 'ERROR',
        message: `No user with email "${targetEmail}" found to update`
      };
    } else {
      // TODO: Determine the next match of the user (todays date etc.)
      return {
        status: 'OK',
        payload: {
          skipNext: foundUser.skip_next_match ? true : false
        }
      };
    }
  }
  /////////////////////////////
  // Update functions
  /////////////////////////////
  function updateCoffeeDays(
    targetEmail: string,
    coffeeDays: string[]
  ): { coffeeDays: string[] } {
    // TODO: make a user exists
    const { payload: foundUser } = findUserByEmail(targetEmail);

    if (!foundUser) {
      throw new Error(`No user with email: "${targetEmail}" found to update`);
    }

    const coffeeDayStr = coffeeDays.map(day => WEEKDAYS[day]).join('');
    const updateStmt = db.prepare(
      `UPDATE User SET
        coffee_days = ?
        WHERE id = ?`
    );

    // QUESTION ???
    // NOTE: will queryResult.changes still be one if the values are the same??
    let queryResult;
    try {
      queryResult = updateStmt.run(coffeeDayStr, foundUser.id);

      if (queryResult.changes === 0) {
        throw new Error();
      }
    } catch (_e) {
      throw new Error('Could not update coffee days');
    }

    return { coffeeDays };
  }
  function _prev_updateCoffeeDays(
    targetEmail: string,
    coffeeDays: string[]
  ): ISqlOk | ISqlError {
    const { payload: foundUser } = findUserByEmail(targetEmail);

    if (!foundUser) {
      return {
        status: 'ERROR',
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
      ? { status: 'OK', payload: coffeeDays.join(' ') }
      : { status: 'ERROR', message: 'Did not update coffee days' };
  }

  function updateWarningException(
    targetEmail: string,
    warningException: boolean
  ): ISqlOk | ISqlError {
    const { payload: foundUser } = findUserByEmail(targetEmail);

    if (!foundUser) {
      return {
        status: 'ERROR',
        message: `No user with email "${targetEmail}" found to update`
      };
    }

    const updateStmt = db.prepare(
      `UPDATE User SET
      warning_exception = ?
      WHERE email = ?` // Note: using email, since I will remove id primary key
    );
    const warningsAsInt = warningException ? '1' : '0';
    const queryResult = updateStmt.run(warningsAsInt, targetEmail);

    return queryResult.changes !== 0
      ? {
          status: 'OK',
          payload: {
            warning_exception: warningsAsInt === '1' ? true : false
          }
        }
      : {
          status: 'ERROR',
          message: `Error: could not update warning exceptions`
        };
  }

  function updateSkipNextMatch(
    targetEmail: string,
    warningException: boolean
  ): ISqlOk | ISqlError {
    const { payload: foundUser } = findUserByEmail(targetEmail);

    if (!foundUser) {
      return {
        status: 'ERROR',
        message: `No user with email "${targetEmail}" found to update`
      };
    }

    const updateStmt = db.prepare(
      `UPDATE User SET
      skip_next_match = ?
      WHERE email = ?` // Note: using email, since I will remove id primary key
    );
    const skipAsInt = warningException ? '1' : '0';
    const queryResult = updateStmt.run(skipAsInt, targetEmail);

    return queryResult.changes !== 0
      ? {
          status: 'OK',
          payload: {
            warning_exception: skipAsInt === '1' ? true : false
          }
        }
      : {
          status: 'ERROR',
          message: `Error: could not update warning exceptions`
        };
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
       )
       ORDER BY Match.date`);
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
      WHERE User_Match.user_id <> ${targetUserId}
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
       ORDER BY Match.date
      `);
    }

    return findMatches.all();
  }

  //////////////////////////////
  // Main Query: MakeMatches
  //////////////////////////////
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

  // TODO: fix this!
  // raw SQL works, but not the same expected object when using better-sql api
  // emails are not being populated
  function getTodaysUsersWithPrevMatches(dayToMatch?: WEEKDAYS) {
    const sqlQuery = db.prepare(`
    with todayMatches as (SELECT U.*,  U.id as u_id, count (UM.user_id) as num_matches, M.id as mid FROM User U
        LEFT JOIN User_Match UM
        ON U.id = UM.user_id
        LEFT JOIN Match M
        ON UM.match_id = M.id
        WHERE U.coffee_days LIKE '%1%'
        AND U.skip_next_match <> 1
        GROUP BY UM.user_id
        ORDER BY num_matches desc),

    totalMatches as (select * from todayMatches TM2
        INNER JOIN User_Match UM2
        ON TM2.id = UM2.user_id
        INNER JOIN Match M2
        ON UM2.match_id = M2.id)
    SELECT * FROM totalMatches TM3
      INNER JOIN totalMatches TM4
      ON TM3.match_id = TM4.match_id
      AND TM3.user_id != TM4.user_id
      ORDER BY TM3.email, TM3.date
    `);

    return sqlQuery.all();
  }

  return {
    // Important
    getPrevMatches,
    getTodaysMatches,
    // getTodaysUsersWithPrevMatches,

    // Basic Queries
    find,
    findUserByEmail,
    getUsersToMatch,
    getCoffeeDays,
    getWarningStatus,
    getNextStatus,

    // Mutations
    add: addUser,
    updateCoffeeDays,
    updateSkipNextMatch,
    updateWarningException,

    // Basic Table methods
    createTable,
    count,
    _deleteRecords
  };
}
