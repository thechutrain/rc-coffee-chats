import sqlite from 'better-sqlite3';
import { Model } from './model';

import * as path from 'path';
import * as types from './dbTypes';

import { TABLE_NAME as UserModelName, FIELDS as UserFields } from './user';
import { TABLE_NAME as MatchModelName, FIELDS as MatchFields } from './match';

export const RELATIONS: types.IRelation[] = [
  {
    foreignKey: 'user_id',
    refTable: 'User',
    refColumn: 'id'
  },
  {
    foreignKey: 'match_id',
    refTable: 'Match',
    refColumn: 'id'
  }
];

export const TABLE_NAME = 'UserMatch';
export const FIELDS: types.fields = {
  id: {
    type: 'INTEGER',
    isPrimaryKey: true,
    isNotNull: true,
    isUnique: true
  },
  user_id: {
    type: 'INTEGER',
    isNotNull: true,
    isUnique: true,
    foreignKey: {
      refTable: UserModelName,
      refColumn: 'id' // quickcheck: `${UserFields.id}`
    }
  },
  match_id: {
    type: 'INTEGER',
    isNotNull: true,
    isUnique: true,
    foreignKey: {
      refTable: MatchModelName,
      refColumn: 'id' // MatchFields.id
    }
  }
};

export class UserMatchModel extends Model {
  protected readonly tableName = TABLE_NAME;
  protected fields: types.fields = FIELDS;
  protected relations: types.IRelation[] = RELATIONS;

  constructor(db) {
    super(db);

    this.__createTable();
  }
}

// ========= TESTING!!!! ===============
const DB_PATH = path.join(__dirname, '-user-match-model-test.db');
const dbConnection = new sqlite(DB_PATH);
const match = new UserMatchModel(dbConnection);
// console.log(match.count());
