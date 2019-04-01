import sqlite from 'better-sqlite3';
import { TABLE_NAME as user_table_name } from './user';
import { TABLE_NAME as match_table_name } from './match';
// Models
// import { initUserModel } from './user';
// import { initMatchModel } from './match';
// import { initUserMatchModel } from './usermatch';

// TODO: make more strict interface types on the initDB return type
export function initDB(
  dbFilePath: string,
  fileMustExist = true
): { user: any; match: any } {
  // Note: can set readonly, fileMustExist, timeout etc
  const db = new sqlite(dbFilePath, { verbose: console.log, fileMustExist });

  // Initialize Models here:
  // const user = initUserModel(db);
  // const match = initMatchModel(db);
  // const userMatch = initUserMatchModel(db);

  // Ensure Tables have been also created:
  // user.createTable();
  // match.createTable();
  // userMatch.createTable();

  return {
    user: {},
    match: {}
  };
}
