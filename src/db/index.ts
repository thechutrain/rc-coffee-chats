import sqlite from 'better-sqlite3';

// Models
import { UserModel } from './models';

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
