import models from './models';
import DIYSqliteORM from './databaseWrapper';
import * as fs from 'fs';
import Database from 'better-sqlite3';

// init sqlite db
const initDB = (dbFile = process.env.DATABASE_FILE) => {
  const exists = fs.existsSync(dbFile);
  const db = new Database(dbFile, { verbose: console.log });
  // if ./.data/sqlite.db does not exist, create it, otherwise print records to console
  const dbWrapper = DIYSqliteORM(db, models);
  if (!exists) {
    dbWrapper.createTables();
  }

  const getUserConfigs = ({ emails }) =>
    dbWrapper.users.get({
      attrs: ['email', 'coffee_days'],
      where: `email in ("${emails.join('","')}")`
    });

  const getEmailExceptions = ({ tableName }) => {
    return dbWrapper[tableName].get({ attrs: ['email'] }).map(v => v.email);
  };

  const insertCoffeeDaysForUser = (fromEmail, coffeeDays) =>
    dbWrapper.users.create(
      { email: fromEmail, coffee_days: coffeeDays },
      { orReplace: true }
    );

  const clearNoNextMatchTable = () => dbWrapper.noNextMatch.delete();

  const getPastMatches = emails =>
    dbWrapper.matches.get({
      where: `email1 in ("${emails.join('","')}")
    OR email2 in ("${emails.join('","')}")`
    });

  const insertIntoMatches = match =>
    dbWrapper.matches.create({
      date: new Date().toISOString().split('T')[0],
      email1: match[0],
      email2: match[1]
    });

  const insertIntoWarningExceptions = email =>
    dbWrapper.warningsExceptions.create({ email }, { orReplace: true });

  const deleteFromWarningExceptions = email =>
    dbWrapper.warningsExceptions.delete(`email = "${email}"`);

  const insertIntoNoNextMatch = email =>
    dbWrapper.noNextMatch.create({ email });

  return {
    dbWrapper,
    clearNoNextMatchTable,
    deleteFromWarningExceptions,
    getEmailExceptions,
    getPastMatches,
    getUserConfigs,
    insertCoffeeDaysForUser,
    insertIntoMatches,
    insertIntoWarningExceptions,
    insertIntoNoNextMatch
  };
};

export default initDB;
