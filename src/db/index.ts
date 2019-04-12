import sqlite from 'better-sqlite3';

// Models
import { UserModel, UserMatchModel, MatchModel } from './models';

export function initDB(
  dbFilePath: string,
  fileMustExist = true
): { User: UserModel; Match: MatchModel; UserMatch: UserMatchModel } {
  // Note: can set readonly, fileMustExist, timeout etc
  const db_connection = new sqlite(dbFilePath, {
    verbose: console.log,
    fileMustExist
  });

  // Initialize Models:
  const User = new UserModel(db_connection);
  const Match = new MatchModel(db_connection);
  const UserMatch = new UserMatchModel(db_connection, User, Match);

  return {
    User,
    Match,
    UserMatch
  };
}
