import * as nonVerboseSqlite3 from 'sqlite3';
import * as fs from 'fs';
import logger from './logger';

// init sqlite db
const initDB = () => {
  const dbFile = './.data/sqlite.db';
  const exists = fs.existsSync(dbFile);
  const sqlite3 = nonVerboseSqlite3.verbose();
  const db = new sqlite3.Database(dbFile);

  // if ./.data/sqlite.db does not exist, create it, otherwise print records to console
  db.serialize(() => {
    if (!exists) {
      db.run(`CREATE TABLE matches (
                date TEXT NOT NULL,
                email1 TEXT NOT NULL,
                email2 TEXT NOT NULL
              );`);
      db.serialize(() => {
        db.run('CREATE INDEX date_index ON matches (date)');
        db.run('CREATE INDEX email1_index ON matches (email1)');
        db.run('CREATE INDEX email2_index ON matches (email2)');
        db.run('CREATE INDEX email1_email2_index ON matches (email1, email2)');
        logger.info('New table "matches" created!');
      });
      db.run(`CREATE TABLE warningsExceptions (
            email TEXT NOT NULL
      );`);
      db.run(`CREATE TABLE noNextMatch (
            email TEXT NOT NULL
      );`);
    } else {
      db.serialize(() => {
        db.run(
          'CREATE TABLE IF NOT EXISTS users (email STRING NOT NULL UNIQUE, coffee_days STRING NOT NULL);'
        );
        db.serialize(() => {
          db.run(
            'CREATE INDEX IF NOT EXISTS users_email_index ON users (email);'
          );
        });
      });
      logger.info('Database "matches" ready to go!');
    }
  });
  const getUserConfigs = async ({ emails }) => {
    const userConfigs = await new Promise((resolve, reject) => {
      db.all(
        `SELECT email, coffee_days
              FROM users
              WHERE email in ("${emails.join('","')}")`,
        [],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
    return userConfigs;
  };

  const getEmailExceptions = async ({ tableName }) => {
    let rowsAsMap: any[];
    await new Promise((resolve, reject) => {
      db.all(`SELECT email FROM ${tableName}`, (err, rows) => {
        rowsAsMap = rows;
        err ? reject(err) : resolve(rows);
      });
    });
    const exceptionsList = rowsAsMap.map(v => v.email);

    return exceptionsList;
  };

  const insertCoffeeDaysForUser = (fromEmail, coffeeDays) =>
    db.serialize(() => {
      db.run(
        'INSERT OR REPLACE INTO users(email, coffee_days) VALUES (?, ?)',
        fromEmail,
        coffeeDays
      );
    });

  const clearNoNextMatchTable = async () => {
    db.serialize(() => {
      db.run(`DELETE FROM noNextMatch`);
    });
  };

  const getPastMatches = async emails => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT *
              FROM matches
              WHERE email1 in ("${emails.join('","')}")
              OR email2 in ("${emails.join('","')}")`,
        [],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
  };

  const insertIntoMatches = match =>
    db.serialize(() => {
      db.run(
        `INSERT INTO matches(date, email1, email2) VALUES ("${
          new Date().toISOString().split('T')[0]
        }", "${match[0]}", "${match[1]}")`
      );
    });

  const insertIntoWarningExceptions = email =>
    db.serialize(() => {
      db.run(
        'INSERT OR REPLACE INTO warningsExceptions(email) VALUES (?)',
        email
      );
    });

  const deleteFromWarningExceptions = email =>
    db.serialize(() => {
      db.run('DELETE FROM warningsExceptions WHERE email=?', email);
    });

  const insertIntoNoNextMatch = email =>
    db.serialize(() => {
      db.run('insert into noNextMatch (email) values(?)', email);
    });
  return {
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
