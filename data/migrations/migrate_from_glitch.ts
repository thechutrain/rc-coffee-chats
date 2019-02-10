import sqlite from 'better-sqlite3';
import * as path from 'path';

import activeUsers from '../migrations/activeUsers.js'; // currently subscribed to zulip users
import { initDB } from '../../src/db';

const pathGlitchDb = path.join(__dirname, '../', 'glitch_02_09_2019.db');
const pathNewDb = path.join(__dirname, '../', 'migrated.db');

////////////////////////////////////
// Create db connections to old glitch db & new prod db
////////////////////////////////////
const glitchDB = new sqlite(pathGlitchDb, {
  verbose: console.log,
  fileMustExist: true
});

const newDb = new sqlite(pathNewDb);
const { user, match } = initDB(pathNewDb, false);
user._deleteRecords();
match._deleteRecords();

////////////////////////////////////
// Update the users table
////////////////////////////////////
// 1) get all users from glitch db & add them to new db;
// NOTE: also need to get users who are subscribed to the stream!!
(() => {
  const glitchUsers = glitchDB.prepare(`SELECT * FROM users`).all();
  const insert = newDb.prepare(
    `INSERT INTO User (email, full_name, coffee_days, is_active) VALUES (@email, @email, @coffee_days, @is_active)`
  );

  // Add all users currently subscribed to the coffeechat stream
  activeUsers.forEach(oldUser => {
    insert.run({
      email: oldUser,
      full_name: oldUser,
      coffee_days: '1234',
      is_active: '1'
    });
  });

  // Add all users from glitch user table
  let duplicate = 0;
  let addedFromGlitchTable = 0;
  glitchUsers.forEach(oldUser => {
    try {
      insert.run({
        email: oldUser.email,
        full_name: oldUser.full_name,
        coffee_days: `${oldUser.coffee_days}`,
        is_active: '0'
      });
      addedFromGlitchTable += 1;
    } catch (e) {
      duplicate += 1;
    }
  });

  // Sanity Check:
  console.log('============== Migrated Users table ==============');
  console.log(`Users subscribed to Stream: ${activeUsers.length}`);
  console.log(`Users added from Glitch table: ${addedFromGlitchTable}`);
  console.log(
    `Users that were a duplicate from subscribed stream & glitch table: ${duplicate}`
  );
  console.log(`Total number of Users in new User table: ${user.count()}`);
})();

///////////////////////////
// update warning exceptions
///////////////////////////
(() => {
  const warningExceptionUsers = glitchDB
    .prepare(`select * from warningsexceptions`)
    .all();
  let warningsChanged = 0;
  let userNoLongerExists = 0;
  warningExceptionUsers.forEach(rawUser => {
    const stmt = newDb.prepare(`UPDATE User SET is_active = 1 where email = ?`);
    const result = stmt.run(rawUser.email);
    if (result.changes === 0) {
      // All user, no longer on the active on zulip stream
      userNoLongerExists += 1;
    } else {
      // Case: currently subscribed to the stream
      warningsChanged += 1;
    }
  });

  console.log('\n=========== Updating Warning Exceptions ============');
  console.log(
    `Total number of users with warning exceptions from glitch db: ${
      warningExceptionUsers.length
    }`
  );
  console.log(
    `Number of users that were changed in new User table: ${warningsChanged}`
  );
  console.log(
    `Warning exceptions that were skipped (b/c users no longer subscribed): ${userNoLongerExists}`
  );
})();

///////////////////////////
// User Matches
///////////////////////////
(() => {
  const addedMatches = 0;
  const failedMatches = 0;

  // get all user matches
  const prevMatches = glitchDB.prepare(`select * from matches`).all();
  const NUM_PREV_MATCHES = prevMatches.length;

  // for each user match
  // > check if email1 & email2 are found in the users table;
  const validMatches = [];
  prevMatches.forEach(prevMatch => {
    const { email1, email2, date } = prevMatch;
    const userResult = newDb.prepare(
      `Select * FROM User where email = ? OR email = ?`
    );

    const sqlFindResult = userResult.all(email1, email2);
    if (sqlFindResult.length === 2) {
      validMatches.push({
        user1: sqlFindResult[0].id,
        user1_name: sqlFindResult[0].email,
        user2: sqlFindResult[1].id,
        user2_name: sqlFindResult[1].email,
        date
      });
    }
  });

  // console.log(validMatches);
  validMatches.forEach(validMatch => {
    const { user1, user2, date } = validMatch;

    // create a new match record;
    const newMatchSql = newDb.prepare(`INSERT into Match (date) VALUES (?)`);
    const newMatchResult = newMatchSql.run(date);
    if (newMatchResult.changes === 0) {
      console.log('ERROR!!! could not add date');
    } else {
      // create two records in the user_match table
      const match_id = newMatchResult.lastInsertROWID;
      const insertUserMatch = newDb.prepare(
        `INSERT into User_Match (user_id, match_id) VALUES (?, ?)`
      );

      const insertUserMatch_result1 = insertUserMatch.run(user1, match_id);
      const inserUserMatch_result2 = insertUserMatch.run(user2, match_id);
      if (insertUserMatch_result1.changes === 0) {
        throw new Error(`Could not add User_Match: ${user1}`);
      } else if (inserUserMatch_result2.changes === 0) {
        throw new Error(`Could not add User_Match: ${user2}`);
      }
    }
  });
  const NUM_VALID_MATCHES = validMatches.length; // num of valid matches

  console.log(`\n============= MATCHES TABLE ============`);
  console.log(`Total num of prev matches: ${NUM_PREV_MATCHES}`);
  console.log(`Valid num of matches added: ${NUM_VALID_MATCHES}`);
})();
