import logger from './logger';
import * as fs from 'fs';
import * as nonVerboseSqlite3 from 'sqlite3';
import { isArray } from 'lodash';

const models = {
  users: {
    fields: {
      email: {
        type: 'TEXT',
        unique: true
      },
      coffee_days: { type: 'TEXT' }
    },
    indices: ['email']
  },
  matches: {
    fields: {
      date: { type: 'TEXT' },
      email1: { type: 'TEXT' },
      email2: { type: 'TEXT' }
    },
    indices: ['date', 'email1', 'email2', ['email1', 'email2']]
  },
  warningsExceptions: {
    fields: {
      email: { type: 'TEXT' }
    }
  },
  noNextMatch: {
    fields: {
      email: { type: 'TEXT' }
    }
  }
};
// init sqlite db
const initDB = () => {
  const dbFile = process.env.DATABASE_FILE || './.data/dev.db';
  const exists = fs.existsSync(dbFile);
  const sqlite3 = nonVerboseSqlite3.verbose();
  const db = new sqlite3.Database(dbFile);

  const DIYSqliteORM = models => ({
    createTables: (commit = true) => {
      const dbStatements = Object.keys(models).reduce(
        (statements, modelName) => {
          const model = models[modelName];
          const fields = model.fields;
          statements.push(`
            CREATE TABLE ${modelName} (
              ${Object.keys(fields)
                .map(fieldName => {
                  const field = fields[fieldName];
                  return `${fieldName} ${field.type} NOT NULL`;
                })
                .join(', ')}
            );
          `);

          return statements.concat(
            (model.indices || []).map(
              index =>
                `CREATE INDEX ${
                  isArray(index) ? index.join('_') : index
                }_index ON ${modelName} (${
                  isArray(index) ? index.join(', ') : index
                })`
            )
          );
        },
        []
      );
      if (commit) {
        db.serialize(() =>
          dbStatements.forEach(statement => db.run(statement))
        );
      }
      return dbStatements;
    },
    ...Object.keys(models).reduce((methods, modelName) => {
      methods[`${modelName}Create`] = (
        attrs,
        { orReplace, commit } = { orReplace: false, commit: true }
      ) => {
        const statement = `
            INSERT${orReplace ? ' OR REPLACE' : ''} INTO
            ${modelName}(${Object.keys(attrs).join(', ')}) VALUES
            (${Object.values(attrs)})
          `;
        if (commit) db.serialize(db.run(statement));
      };
      methods[`${modelName}Get`] = (attrs = [], where) => {
        const statement = `
            SELECT ${attrs.length ? attrs.join(', ') : '*'} FROM
            modelName WHERE ${where}
          `;
      };
      return methods;
    }, {})
  });

  // if ./.data/sqlite.db does not exist, create it, otherwise print records to console
  if (!exists) {
    DIYSqliteORM.createTables(models);
  }

  const getUserConfigs = async ({ emails }) => {
    const userConfigs = new Promise((resolve, reject) => {
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
    db,
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
