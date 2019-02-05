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
  // TODO: update the function signature to match ISqlSuccess | ISqlError
  function findUserByEmail(email: string): IUserDB | null {
    const findStmt = db.prepare('SELECT * FROM User WHERE email = ?');
    const foundUser = findStmt.get(email);
    // TODO: convert the coffee_days column from 1234 --> Mon, Tues, Wed, Thurs?
    // Do that in the print message?
    return !!foundUser ? foundUser : null;
  }

  function updateCoffeeDays(
    targetEmail: string,
    coffeeDays: WEEKDAYS[]
  ): ISqlSuccess | ISqlError {
    const foundUser = findUserByEmail(targetEmail);

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
      ? { status: 'SUCCESS' }
      : { status: 'FAILURE', message: 'Did not update coffee days' };
  }

  // function toggleSkipNextMatch(valToSet?: boolean) {}

  // function toggleWarningException(valToSet?: boolean) {}

  //////////////////////////////
  // Most Important Query!
  /////////////////////////////
  // NOTE: would be nice to also sort via sql by the number of prevMatches
  function getUsersToMatch(dayToMatch?: WEEKDAYS): any {
    // ): IUserMatchResult[] {
    // const findMatches = db.prepare(`
    //   SELECT User.id, User.email, Match.date
    //   FROM User
    //   LEFT JOIN User_Match
    //     ON User.id = User_Match.user_id
    //   LEFT JOIN Match
    //     ON User_Match.match_id = Match.id
    //   WHERE User.coffee_days LIKE '%1%'
    //   AND User_Match.user_id IN
    //   (SELECT User.id FROM User WHERE User.coffee_days LIKE '%1%')
    // `);
    const coffee_day =
      dayToMatch !== undefined // WEEKDAYS have value of 0-6, so must check if undefined
        ? WEEKDAYS[WEEKDAYS[dayToMatch]] // Pass in MON -->
        : new Date().getDay();

    // TODO: can use this query to get the order of Users. Who ever has the most
    // amount of previous matches goes first!
    const findMatches = db.prepare(`
      SELECT *
      FROM User
      WHERE User.coffee_days LIKE '%${coffee_day}%'
      AND User.skip_next_match <> 1
    `);
    return findMatches.all();
  }

  // NOTE: using today's date to filter out
  // TODO: make coffeeDay default, get value later
  function getUserPrevMatches(
    targetUserId: number,
    includeAllMatches = false,
    coffeeDay?: number
  ) {
    //   const findMatches = db.prepare(`
    //   SELECT User_Match.user_id, Match.date
    //   FROM User
    //   LEFT OUTER JOIN User_Match
    //     ON User.id = User_Match.user_id
    //   LEFT OUTER JOIN Match
    //     ON User_Match.match_id = Match.id
    //   WHERE User.id = 1
    //   AND User.coffee_days LIKE '%1%'
    //   AND User_Match.user_id IN
    //   (SELECT User.id FROM User WHERE User.coffee_days LIKE '%1%')
    // `);
    let findMatches;
    if (includeAllMatches) {
      findMatches = db.prepare(`
      SELECT User.id, User.email, Match.date
      FROM User
      LEFT OUTER JOIN User_Match
        ON User.id = User_Match.user_id
      LEFT OUTER JOIN Match
        ON User_Match.match_id = Match.id
    
      WHERE User_Match.match_id in (SELECT Match.id
        FROM User
        LEFT OUTER JOIN User_Match
          ON User.id = User_Match.user_id
        LEFT OUTER JOIN Match
          ON User_Match.match_id = Match.id
        WHERE User.id = ${targetUserId}
        AND User_Match.user_id <> ${targetUserId}`);
    } else {
      // EXCLUDES: matches if the other user has not selected today as their day to match
      const coffeeDayInt = coffeeDay ? coffeeDay : new Date().getDay();

      findMatches = db.prepare(`
    SELECT User.id, User.email, Match.date
    FROM User
    LEFT OUTER JOIN User_Match
      ON User.id = User_Match.user_id
    LEFT OUTER JOIN Match
      ON User_Match.match_id = Match.id
  
    WHERE User_Match.match_id in (SELECT Match.id
      FROM User
      LEFT OUTER JOIN User_Match
        ON User.id = User_Match.user_id
      LEFT OUTER JOIN Match
        ON User_Match.match_id = Match.id
      WHERE User.id = ${targetUserId}
      AND User.coffee_days LIKE '%${coffeeDayInt}%')
      AND User_Match.user_id <> ${targetUserId}
    `);
    }

    // AND User_Match.user_id IN
    // (SELECT User.id FROM User WHERE User.coffee_days LIKE '%1%')
    return findMatches.all();
  }

  return {
    createTable,
    count,
    find: findUserByEmail,
    updateCoffeeDays,
    getUsersToMatch,
    getUserPrevMatches,
    // getUsersByCoffeeDay,
    // findUserMatch: findUserWithPrevMatches,
    add: addUser,
    _deleteRecords
    // update: updateUser
  };
}

// ======== DB ==========
// function dropTable(): ISqlResponse {
//   try {
//     db.exec(`DROP TABLE User`);
//   } catch (e) {
//     return { status: 'FAILURE', message: e };
//   }
//   return { status: 'SUCCESS', message: 'Dropped User table' };
// }

// ======= TODO: make this flexible ===============
// Note: add flexibility to overwrite a previous user if they exists?
// function updateUser(targetEmail: string, opts: IUpdateUserArgs): boolean {
//   // Check if the user exists
//   const targetUser = findUserByEmail(targetEmail);
//   if (!targetUser) {
//     throw new Error(
//       `No user found with email "${targetEmail}", insert first`
//     );
//   }

//   const colVals = {
//     coffee_days: opts.coffee_days || targetUser.coffee_days,
//     skip_next_match: castBoolInt(
//       opts.skip_next_match || targetUser.skip_next_match
//     ),
//     warning_exceptions: castBoolInt(
//       opts.warning_exception || targetUser.warning_exception
//     ),
//     is_active: castBoolInt(opts.is_active || targetUser.is_active),
//     is_faculty: castBoolInt(opts.is_faculty || targetUser.is_faculty),
//     is_alum: castBoolInt(opts.is_alum || targetUser.is_alum)
//   };
//   const updateStmt = db.prepare(
//     `UPDATE User SET
//     coffee_days = ?,
//     skip_next_match = ?,
//     warning_exception = ?,
//     is_active = ?,
//     is_faculty = ?,
//     is_alum = ?
//     WHERE user_id = ?`
//   );

//   const queryResults = updateStmt.run(
//     colVals.coffee_days,
//     colVals.skip_next_match,
//     colVals.warning_exceptions,
//     colVals.is_active,
//     colVals.is_faculty,
//     colVals.is_alum,
//     targetUser.user_id
//   );

//   // Check that you've updated at least one row
//   return queryResults.changes !== 0;
// }
