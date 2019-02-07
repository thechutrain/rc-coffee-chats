import sqlite from 'better-sqlite3';
import { ISqlOk, ISqlError } from './db.interface';

const TABLE_NAME = 'User_Match';

export function initUserMatchModel(db: sqlite): any {
  function createTable(): void {
    const query = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id INTEGER PRIMARY KEY NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES User (id)
      ON DELETE CASCADE ON UPDATE NO ACTION,
      FOREIGN KEY (match_id) REFERENCES Match (id)
      ON DELETE CASCADE ON UPDATE NO ACTION
    )`;

    db.exec(query);
  }

  function _deleteRecords(): void {
    const query = `DELETE FROM ${TABLE_NAME} WHERE true`;
    db.exec(query);
  }

  function count(): number {
    const stmt = db.prepare(`SELECT COUNT(id) FROM ${TABLE_NAME}`);
    const { 'COUNT(id)': numRecord } = stmt.get();
    return numRecord;
  }

  function add(user_id: string, match_id: string): ISqlOk | ISqlError {
    const insertSQL = db.prepare(
      `INSERT INTO ${TABLE_NAME} (user_id, match_id) VALUES (?, ?)`
    );

    const { changes, lastInsertRowid } = insertSQL.run(user_id, match_id);

    if (changes) {
      return { status: 'OK', payload: { lastInsertRowid } };
    } else {
      return {
        status: 'FAILURE',
        message: 'ERROR: could not add to User_Match'
      };
    }
  }

  return {
    createTable,
    count,
    add,
    _deleteRecords
  };
}
