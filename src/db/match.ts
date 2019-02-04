import sqlite from 'better-sqlite3';

import {
  ISqlSuccess,
  ISqlError,
  IAddMatchArgs,
  IMatchDB
} from './db.interface';

const TABLE_NAME = 'Match';

// interface IMatchModel {
//   createTable: () => ISqlResponse;
//   cleanTable?: () => ISqlResponse; // TODO: remove this? allow only for testing?
//   count: () => ISqlError | number;
//   find: (targetUserId: number) => ISqlResponse;
//   add: (opts: IAddMatchArgs) => ISqlResponse;
// }

// TODO: update the exposed match model methods later
export function initMatchModel(db: sqlite): any {
  // Always have a created Table!
  // createTable();

  function createTable(): void {
    const query = `CREATE TABLE IF NOT EXISTS Match (
      match_id INTEGER PRIMARY KEY NOT NULL UNIQUE,
      user_1_id INTEGER NOT NULL,
      user_2_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (user_1_id) REFERENCES User (user_id)
      ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (user_2_id) REFERENCES User (user_id)
      ON DELETE CASCADE ON UPDATE NO ACTION
    )`;

    // const query = `CREATE TABLE IF NOT EXISTS Match (
    //   match_id INTEGER PRIMARY KEY NOT NULL UNIQUE,
    //   user_1_id INTEGER NOT NULL references User(user_id),
    //   user_2_id INTEGER NOT NULL references User(user_id),
    //   date TEXT NOT NULL
    // )`;

    db.exec(query);
  }

  // Rename to remove all records & use it in the test
  function _deleteRecords() {
    const query = `DELETE FROM ${TABLE_NAME} WHERE true`;
    db.exec(query);
  }

  function count(): number {
    const stmt = db.prepare(`SELECT COUNT(match_id) FROM Match`);
    const { 'COUNT(match_id)': numRecord } = stmt.get();
    return numRecord;
  }

  // TODO: (LATER) add flexiblity to find targetUser via email
  // Question?? Relationship query of getting a user's matches. Should this be in user table?
  // - fn: getMatches by day?
  // - fn: get all matches for particular user?
  // - fn: get match by match_id

  function findAllUserMatches(targetUser: number): IMatchDB {
    const findStmt = db.prepare(
      `SELECT * FROM Match WHERE user_1_id = ? OR user_2_id = ?`
    );
    // let matches = [];
    return findStmt.all(targetUser, targetUser);
  }

  function addMatch(matchArgs: IAddMatchArgs): ISqlSuccess | ISqlError {
    // const insertQuery = db.prepare(`
    // INSERT INTO ${TABLE_NAME} (user_1_id, user_2_id, date) VALUES (@user_1_id, @user_2_id, @date)`);

    const insertQuery = db.prepare(`
    INSERT INTO Match (user_1_id, user_2_id, date) VALUES (?, ?, ?)`);

    // TODO: validate that date is in the right format
    const { user_1_id, user_2_id } = matchArgs;
    const date = matchArgs.date || new Date().toISOString().split('T')[0];

    let queryResult;
    try {
      queryResult = insertQuery.run(user_1_id, user_2_id, date);
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }

    return queryResult.info !== 0
      ? { status: 'SUCCESS' }
      : { status: 'FAILURE', message: 'Error: could not add match ' };
  }

  // TODO: (LATER) add flexbility to update match by emails?
  // interface IupdateMatchArgs {
  //   user_id_1: number,
  //   user_id_2: number,
  // }
  // function updateMatch()

  return {
    createTable,
    _deleteRecords,
    count,
    find: findAllUserMatches,
    add: addMatch
    // update: updateMatch // TODO: later
  };
}
