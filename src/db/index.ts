import * as path from 'path';
import * as fs from 'fs';
import Database from 'better-sqlite3';

// Models
import { initUserModel, IUserTableMethods } from './user.model';

export interface ISqlResponse {
  status: 'SUCCESS' | 'FAILURE';
  message?: string;
  payload?: any; // valid model?
}

// tslint:disable-next-line
type dbMethods = {
  // createUserTable: () => ISqlResponse;
  // addUser: (userVals: IAddUserArgs) => ISqlResponse;
  user: IUserTableMethods;
  createMatchTable: () => ISqlResponse;
  closeDb: () => ISqlResponse;
};

export function initDB(dbFile: string): dbMethods {
  const dataDir = path.join(__dirname, '../../', '.data/');
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
  const db = new Database(fullDbPath, { verbose: console.log });

  return {
    user: initUserModel(db),
    // createUserTable: initCreateUserTable(db),
    // addUser: initAddUserTable(db),
    createMatchTable: initCreateMatchTable(db),
    closeDb: initCloseDb(db)
  };
}

// =========== queries =========

// == UserMatch table ==
function initCreateMatchTable(db: Database): () => ISqlResponse {
  return () => {
    const createMatchTableSql = db.prepare(`CREATE TABLE IF NOT EXISTS UserMatch (
      match_id INTEGER NOT NULL UNIQUE,
      user_1 INTEGER NOT NULL,
      user_2 INTEGER NOT NULL,
      date TEXT,
      rain_checked INTEGER DEFAULT 0,
      PRIMARY KEY (match_id),
      FOREIGN KEY (user_1) REFERENCES User (user_id),
      FOREIGN KEY (user_2) REFERENCES User (user_id)
    )`);
    try {
      createMatchTableSql.run();
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }
    return { status: 'SUCCESS' };
  };
}

// Close DB connection
function initCloseDb(db): () => ISqlResponse {
  return () => {
    try {
      db.close();
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }
    return { status: 'SUCCESS' };
  };
}

// ========= TESTING ===========
const { user, createMatchTable } = initDB('test.db');

const fooUser = { email: 'foo@gmail.com', full_name: 'Foo Foo' };
const barUser = { email: 'bar@gmail.com', full_name: 'Bar Bar' };
// Create Table
user.createTable();
user.add(fooUser);
user.add(barUser);

// console.log(response);
// console.log(createMatchTable());
