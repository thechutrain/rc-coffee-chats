import * as path from 'path';
import * as fs from 'fs';
import sqlite from 'better-sqlite3';

// Models
import { initUserModel } from './user';
import { initMatchModel } from './match';

// dbFilePath & connect to new db?
// export function initDB(dbFilePath: string, fileMustExists = true): IDBMethods {
export function initDB(dbFile: string): any {
  // NOTE: Should all only reading a new db?
  // Should I make it more strict to create vs connect db?
  const dataDir = path.join(__dirname, '../../', 'data/');

  const fullDbPath = path.join(dataDir, dbFile);
  const dbExists = fs.existsSync(fullDbPath);

  // Debugging:
  if (process.env.DEBUG) {
    const message = dbExists
      ? `db exists: "${fullDbPath}"`
      : `db doest NOT exists: "${fullDbPath}" \ncreating db now ...`;
    console.log(message);
  }

  // NOTE: should check that dbFile name is a valid db file before trying
  // to create one
  // Note: can set readonly, fileMustExist, timeout etc
  const db = new sqlite(fullDbPath, { verbose: console.log });

  return {
    user: initUserModel(db),
    match: initMatchModel(db)
    // closeDb: initCloseDb(db) // probably dont need this
  };
}

// =========== queries =========

// == UserMatch table ==
// function initCreateMatchTable(db: sqlite): () => ISqlResponse {
//   return () => {
//     const createMatchTableSql = db.prepare(`CREATE TABLE IF NOT EXISTS UserMatch (
//       match_id INTEGER NOT NULL UNIQUE,
//       user_1 INTEGER NOT NULL,
//       user_2 INTEGER NOT NULL,
//       date TEXT,
//       rain_checked INTEGER DEFAULT 0,
//       PRIMARY KEY (match_id),
//       FOREIGN KEY (user_1) REFERENCES User (user_id),
//       FOREIGN KEY (user_2) REFERENCES User (user_id)
//     )`);
//     try {
//       createMatchTableSql.run();
//     } catch (e) {
//       return { status: 'FAILURE', message: e };
//     }
//     return { status: 'SUCCESS' };
//   };
// }

// Close DB connection
// function initCloseDb(db): () => ISqlResponse {
//   return () => {
//     try {
//       db.close();
//     } catch (e) {
//       return { status: 'FAILURE', message: e };
//     }
//     return { status: 'SUCCESS' };
//   };
// }
