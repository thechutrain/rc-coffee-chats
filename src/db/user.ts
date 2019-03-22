import sqlite from 'better-sqlite3';
import { Model } from './model';

import * as path from 'path';
import * as types from './dbTypes';

export const TABLE_NAME = 'User';
export const FIELDS: types.fields = {
  id: {
    type: 'INTEGER',
    isPrimaryKey: true,
    isNotNull: true,
    isUnique: true
  },
  email: {
    type: 'TEXT',
    isUnique: true,
    isNotNull: true
  },
  full_name: {
    type: 'TEXT',
    isNotNull: true
  },
  coffee_days: {
    type: 'TEXT',
    defaultValue: '1234'
  },
  warning_exception: {
    type: 'INTEGER',
    defaultValue: '0'
  },
  is_active: {
    type: 'INTEGER',
    defaultValue: '1'
  },
  is_faculty: {
    type: 'INTEGER',
    defaultValue: '0'
  }
};

export class UserModel extends Model {
  // TODO: make an interface so UserModel implements these things:
  protected readonly tableName = TABLE_NAME;
  protected fields: types.fields = FIELDS;
  protected relations: types.IRelation[] = [];

  constructor(db) {
    super(db);

    // Note: underscore method ensures I dont overwrite, lives in abstract model class
    this.__createTable();
    // Model.createTable(this.tableName, this.fields);
  }

  // creates a newRecord
  // TODO: make this flexible
  public add(queryArgs = {}): { changes: number; lastInsertROWID: number } {
    const { db } = Model;
    // 1) figure out what the required params are:
    // Map through the Fields & filter for
    // fields that are isNotNull == true && isPrimaryKey == false
    const reqFields = Object.keys(this.fields).filter(field => {
      const { isPrimaryKey, isNotNull } = this.fields[field];
      // Note: since primary key will autoincrement, never allow users to
      // specify primary key when adding a new record
      return isPrimaryKey ? false : isNotNull;
    });

    // 2) determine that the given args has those required params
    for (const field of reqFields) {
      if (!Object.prototype.hasOwnProperty.call(queryArgs, field)) {
        // ErrorType: missing required field
        throw new Error(
          `cannot add a new record in table "${
            this.tableName
          }" because you are missing an argument of "${field}"`
        );
      }
    }

    // 3) invoke the validatorFn for each field && check if arg
    // is in the field?
    for (const argKey in queryArgs) {
      if (!Object.prototype.hasOwnProperty.call(this.fields, argKey)) {
        // ErrorType: extra arg that is not related to any field
        throw new Error(
          `add a new record was provided a key of "${argKey}" that is not associated with any field on the table "${
            this.tableName
          }"`
        );
      }

      const { validatorFn } = this.fields[argKey];

      if (validatorFn && validatorFn(queryArgs[argKey])) {
        // ErrorType: arg failed validation
        throw new Error(
          `provided argument of "${queryArgs[argKey]}" failed validation`
        );
      }
    }

    // 4) create query
    const fields = Object.keys(queryArgs);
    const fieldPlaceholder = fields.map(f => `@${f}`);

    const queryStr = `INSERT INTO ${this.tableName} (
      ${fields.join(', ')}
      ) VALUES (
      ${fieldPlaceholder.join(', ')}
      )`;

    // 5) run query
    const query = db.prepare(queryStr);
    const result = query.run(queryArgs);

    console.log(result);
    return result;
  }

  public exists(): boolean {
    return false;
  }

  // QUESTION: how to make args of find
  // be a record where key has to be property
  public find() {
    // returns user | user[]
  }

  public update() {}
}

// ========= TESTING!!!! ===============
const DB_PATH = path.join(__dirname, '-user-model-test.db');
const user = new UserModel(new sqlite(DB_PATH));
// user.add({ email: 'a@gmail.com', full_name: 'a', wrong: 'should not exist' });
user.add({ email: 'a@gmail.com', full_name: 'a', coffee_days: '123' });
// user.add({ email: 'a@gmail.com', full_name: 'a' });
// user.count();
