import sqlite from 'better-sqlite3';
import { Model } from './model';

import * as path from 'path';
import * as types from './dbTypes';

export const TABLE_NAME = 'Match';
export const FIELDS: types.fields = {
  id: {
    type: 'INTEGER',
    isPrimaryKey: true,
    isNotNull: true,
    isUnique: true
  },
  date: {
    type: 'TEXT',
    isNotNull: true,
    isValidFn: input => {
      return true;
    }
  }
};

export class MatchModel extends Model {
  protected readonly tableName = TABLE_NAME;
  protected fields: types.fields = FIELDS;
  protected relations: types.IRelation[] = [];

  constructor(db) {
    super(db);
    this.__createTable();
  }
}

// ========= TESTING!!!! ===============
// const DB_PATH = path.join(__dirname, '-match-model-test.db');
// const match = new MatchModel(new sqlite(DB_PATH));
// console.log(match.count());
// match.add({});
