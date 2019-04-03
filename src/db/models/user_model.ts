import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { Model } from './base_model';

export class UserModel extends Model<UserRecord> {
  constructor(db: sqlite) {
    super(db, TABLE_NAME, FIELDS);
  }

  // NOTE: current default create() in the Model does not take into account
  // any database constraints (CHECK) this could be a TODO?
  public initTable(): { rawQuery: string } {
    const rawQuery = `CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        coffee_days TEXT DEFAULT 1234,
        skip_next_match INTEGER DEFAULT 0,
        warning_exception INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        is_faculty INTEGER DEFAULT 0,
        CHECK (is_faculty in (0,1)),
        CHECK (is_active in (0,1)),
        CHECK (skip_next_match in (0,1)),
        CHECK (warning_exception in (0,1))
      )`;

    const createStmt = Model.db.prepare(rawQuery);
    createStmt.run();

    return { rawQuery };
  }
}

export type UserRecord = {
  id: number;
  email: string;
  full_name: string;
  coffee_days: string; // NOTE: or the enum days?
  warning_exceptions: boolean;
  is_active: boolean;
  is_faculty: boolean;
};

export const TABLE_NAME = 'User';
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
  email: {
    colName: 'email',
    type: types.sqliteType.TEXT,
    meta: {
      isUnique: true,
      isNotNull: true
    }
  },
  full_name: {
    colName: 'full_name',
    type: types.sqliteType.TEXT,
    meta: {
      isNotNull: true
    }
  },
  coffee_days: {
    colName: 'coffee_days',
    type: types.sqliteType.TEXT,
    meta: {
      defaultValue: '1234'
    }
  },
  skip_next_match: {
    colName: 'skip_next_match',
    type: types.sqliteType.INTEGER,
    meta: {
      defaultValue: '0'
    }
  },
  warning_exception: {
    colName: 'warning_exception',
    type: types.sqliteType.INTEGER,
    meta: {
      defaultValue: '0'
    }
  },
  is_active: {
    colName: 'is_active',
    type: types.sqliteType.INTEGER,
    meta: {
      defaultValue: '1'
    }
  },
  is_faculty: {
    colName: 'is_faculty',
    type: types.sqliteType.INTEGER,
    meta: {
      defaultValue: '0'
    }
  }
};
