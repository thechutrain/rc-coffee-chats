import sqlite from 'better-sqlite3';

// Models
import { initUserModel } from './user';
import { initMatchModel } from './match';
import { initUserMatchModel } from './usermatch';

// TODO: make more strict interface types on the initDB return type
export function initDB(
  dbFilePath: string,
  fileMustExist = true
): { user: any; match: any } {
  // Note: can set readonly, fileMustExist, timeout etc
  const db = new sqlite(dbFilePath, { verbose: console.log, fileMustExist });

  // Initialize Models here:
  const user = initUserModel(db);
  const match = initMatchModel(db);
  initUserMatchModel(db);

  return {
    user,
    match
  };
}
