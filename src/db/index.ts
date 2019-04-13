import * as path from 'path';
import sqlite from 'better-sqlite3';

import { UserModel, UserMatchModel, MatchModel } from './models';
import * as types from './dbTypes';

export function initDB(
  optDbFilePath?: string,
  fileMustExist: boolean = true
): types.myDB {
  const isProd = process.env.NODE_ENV === 'production';
  const defaultDbFile = (isProd
    ? process.env.PROD_DB
    : process.env.DEV_DB) as string;

  const dbFilePath = optDbFilePath
    ? optDbFilePath
    : path.join(__dirname, '../', 'data/', defaultDbFile);
  console.log(dbFilePath);

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
