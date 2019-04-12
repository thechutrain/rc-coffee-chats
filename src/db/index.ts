import sqlite from 'better-sqlite3';
import { UserModel, UserMatchModel, MatchModel } from './models';
import * as types from './dbTypes';

export function initDB(dbFilePath: string, fileMustExist = true): types.myDB {
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
