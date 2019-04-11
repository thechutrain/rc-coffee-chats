import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { Model } from './base_model';

export class UserMatchModel extends Model<UserMatchRecord> {
  constructor(db: sqlite) {
    super(db, TABLE_NAME, FIELDS);
    this.initTable();
  }

  public initTable(): { rawQuery: string } {
    const rawQuery = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
      id INTEGER PRIMARY KEY NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES User (id)
      ON DELETE CASCADE ON UPDATE NO ACTION,
      FOREIGN KEY (match_id) REFERENCES Match (id)
      ON DELETE CASCADE ON UPDATE NO ACTION
    )`;

    const createStmt = Model.db.prepare(rawQuery);
    createStmt.run();

    return { rawQuery };
  }
}

export type UserMatchRecord = {
  id: number;
  user_id: number;
  match_id: number;
};

export const TABLE_NAME = 'User_Match';

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
  user_id: {
    colName: 'user_id',
    type: types.sqliteType.INTEGER,
    meta: {
      isNotNull: true
    }
  },
  math_id: {
    colName: 'match_id',
    type: types.sqliteType.INTEGER,
    meta: {
      isNotNull: true
    }
  }
};
