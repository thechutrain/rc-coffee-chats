import sqlite from 'better-sqlite3';
import { ISqlResponse } from '../db';

const TABLE_NAME = 'Match';

interface IMatchModel {
  createTable: () => ISqlResponse;
  cleanTable?: () => ISqlResponse; // TODO: remove this? allow only for testing?
  count: () => number;
  find: any;
  add: any;
}

export function initMatchModel(db: sqlite): IMatchModel {
  function createTable(): ISqlResponse {
    const query = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      match_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_1_id INTEGER NOT NULL,
      user_2_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (user_1_id) REFERENCES User (user_id)
        ON DELETE CASCADE ON UPDATE NO ACTION,
      FOREIGN KEY (user_2_id) REFERENCES User (user_id)
        ON DELETE CASCADE ON UPDATE NO ACTION
    )`;

    try {
      db.exec(query);
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }
    return { status: 'SUCCESS' };
  }

  function cleanTable(): ISqlResponse {
    const query = `DELETE FROM ${TABLE_NAME} WHERE true`;
    try {
      db.exec(query);
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }
    return { status: 'SUCCESS' };
  }

  function count(): number {
    const stmt = db.prepare('SELECT * FROM Match');
    return stmt.all().length;
  }

  // TODO: (LATER) add flexiblity to find targetUser via email
  function findAllUserMatches(targetUser: number): any[] {
    return [];
  }

  // required user_id 1&2, date as option?
  function addMatch() {
    return 'hi';
  }

  // TODO: (LATER) add flexbility to update match by emails?
  // interface IupdateMatchArgs {
  //   user_id_1: number,
  //   user_id_2: number,
  // }
  // function updateMatch()
  return {
    createTable,
    cleanTable,
    count,
    find: findAllUserMatches,
    add: addMatch
    // update: updateMatch // TODO: later
  };
}

// ====== definitions for matches ====
interface IMatchesSqlResposne extends ISqlResponse {
  payload?: any[]; // TODO: determine the shape of the user match (just id, user info minus their matches?)
}
