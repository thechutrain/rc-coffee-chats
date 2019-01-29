import * as path from 'path';
import * as fs from 'fs';

// tslint:disable-next-line
type dbMethods = {};

export function initDB(dbFile: string): dbMethods {
  const dataDir = path.join(__dirname, '../../', '.data/');
  const fullDbPath = path.join(dataDir, dbFile);
  const dbExists = fs.existsSync(fullDbPath);

  if (dbExists) {
    console.log('db exists');
  } else {
    console.log('does not exist');
  }

  return {};
}

// TESTING
initDB('dev_.db');
