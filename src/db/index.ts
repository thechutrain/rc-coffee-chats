import * as path from 'path';
import * as fs from 'fs';
import Database from 'better-sqlite3';

// tslint:disable-next-line
type dbMethods = {
  createUserTable: () => void;
  closeDb: () => void;
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
    closeDb: () => {
      db.close();
    }
  };
}

// =========== queries =========
// USER TABLE
function initCreateUserTable(db: Database) {
  return () => {
    const createUserTableSql = `CREATE TABLE IF NOT EXISTS user(
      user_id INTEGER NOT NULL UNIQUE PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      is_alumn INTEGER DEFAULT 0,
      is_faculty INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      skip_next_match INTEGER DEFAULT 0,
      warning_exception INTEGER DEFAULT 0
    )`;
    db.exec(createUserTableSql);
  };
}

function addUserTable(db: Database) {
  return () => {
    const queryStr = `INSERT INTO user`;
  };
}

// TESTING
const { createUserTable } = initDB('test.db');
createUserTable();
