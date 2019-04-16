import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { Model } from './__base_model';

export class MatchModel extends Model<MatchRecord> {
  constructor(db: sqlite) {
    super(db, TABLE_NAME, FIELDS);
    this.initTable();
  }
}

export type MatchRecord = {
  id: number;
  date: string;
};

export const TABLE_NAME = 'Match';

export const FIELDS: types.fieldListing = {
  id: {
    colName: 'id',
    type: types.sqliteType.INTEGER,
    meta: {
      isPrimaryKey: true,
      isNotNull: true,
      isUnique: true
    }
  },
  date: {
    colName: 'date',
    type: types.sqliteType.TEXT,
    meta: {
      isNotNull: true
    }
  }
};
