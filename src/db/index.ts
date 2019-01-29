import * as path from 'path';
import * as fs from 'fs';
import Database from 'better-sqlite3';

interface ISqlResponse {
  status: 'SUCCESS' | 'FAILURE';
  message?: string;
}

interface IAddUserArgs {
  email: string;
  full_name: string;
}

// tslint:disable-next-line
type dbMethods = {
  createUserTable: () => ISqlResponse;
  addUser: (userVals: IAddUserArgs | IAddUserArgs[]) => ISqlResponse;
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
    createUserTable: initCreateUserTable(db),
    addUser: initAddUserTable(db),
    closeDb: initCloseDb(db)
  };
}

// =========== queries =========
// USER TABLE
function initCreateUserTable(db: Database): () => ISqlResponse {
  return () => {
    // NOTE: should I do this as a prepare() statemnt, and then execute?
    const createUserTableSql = `CREATE TABLE IF NOT EXISTS User (
      user_id INTEGER NOT NULL UNIQUE PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      is_alumn INTEGER DEFAULT 0,
      is_faculty INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      skip_next_match INTEGER DEFAULT 0,
      warning_exception INTEGER DEFAULT 0
    )`;
    try {
      db.exec(createUserTableSql);
    } catch (e) {
      return { status: 'FAILURE', message: e };
    }
    return { status: 'SUCCESS' };
  };
}

function initAddUserTable(db: Database) {
  // (userVals: IAddUserArgs): void;
  // (userVals: IAddUserArgs[]): void ;
  // TODO: add flexibility in receiving an array or single UserArg
  return (userVals: IAddUserArgs | IAddUserArgs[]): ISqlResponse => {
    const insertSQL = db.prepare(
      `INSERT INTO User (email, full_name) VALUES (@email, @full_name)`
    );
    try {
      insertSQL.run(userVals);
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
const { createUserTable, addUser } = initDB('test.db');
createUserTable();

const response = addUser({ email: 'test@gmail.com', full_name: 'Foo bar' });
console.log(response);
