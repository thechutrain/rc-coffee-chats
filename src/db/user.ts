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
// const DB_PATH = path.join(__dirname, '-user-model-test.db');
// const user = new UserModel(new sqlite(DB_PATH));
// // user.add({ email: 'a@gmail.com', full_name: 'a', wrong: 'should not exist' });
// user.add({ email: 'b@gmail.com', full_name: 'bbbbb', coffee_days: '123' });
// // user.add({ email: 'a@gmail.com', full_name: 'a' });
// // user.count();
