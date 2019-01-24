import logger from './logger';
import * as fs from 'fs';
import Database from 'better-sqlite3';
import { isArray, values } from 'lodash';

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
  const db = new Database(dbFile, { verbose: console.log });

  const DIYSqliteORM = (models: any): any => ({
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
                  return `${fieldName} ${field.type} NOT NULL${
                    field.unique ? ' UNIQUE' : ''
                  }`;
                })
                .join(', ')}
            )
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
        dbStatements.forEach(statement => db.prepare(statement).run());
      }
      return dbStatements;
    },
    ...Object.keys(models).reduce((modelInterfaces, modelName) => {
      modelInterfaces[modelName] = {
        create: (attrs, { orReplace } = { orReplace: false }) => {
          const statement = db.prepare(`
            INSERT${orReplace ? ' OR REPLACE' : ''} INTO
            ${modelName}(${Object.keys(attrs).join(', ')}) VALUES
            (${values(attrs)
              .map(x => `"${x}"`)
              .join(', ')})
          `);
          statement.run();
          return true;
        },
        get: ({ attrs, where }) => {
          const statement = db.prepare(`
            SELECT ${attrs ? attrs.join(', ') : '*'} FROM
            ${modelName}${where ? ` WHERE ${where}` : ''}
          `);
          return statement.all();
        },
        delete: where => {
          const statement = db.prepare(`
            DELETE FROM
            ${modelName}${where ? ` WHERE ${where}` : ''}
          `);
          return statement.run();
        }
      };
      return modelInterfaces;
    }, {})
  });

  // if ./.data/sqlite.db does not exist, create it, otherwise print records to console
  const dbWrapper = DIYSqliteORM(models);
  if (!exists) {
    dbWrapper.createTables();
  }

  const getUserConfigs = ({ emails }) => {
    return dbWrapper.users.get({
      attrs: ['email', 'coffee_days'],
      where: `email in ("${emails.join('","')}")`
    });
  };

  const getEmailExceptions = ({ tableName }) => {
    return dbWrapper[tableName].get({ attrs: ['email'] }).map(v => v.email);
  };

  const insertCoffeeDaysForUser = (fromEmail, coffeeDays) =>
    dbWrapper.users.create(
      { email: fromEmail, coffee_days: coffeeDays },
      { orReplace: true }
    );

  const clearNoNextMatchTable = () => {
    dbWrapper.noNextMatch.delete();
  };

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
