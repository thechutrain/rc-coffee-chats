import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { Model } from '../model';

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
    defaultValue: '1234'
  },
  warning_exception: {
    colName: 'warning_exception',
    type: types.sqliteType.INTEGER,
    defaultValue: '0'
  },
  is_active: {
    colName: 'is_active',
    type: types.sqliteType.INTEGER,
    defaultValue: '1'
  },
  is_faculty: {
    colName: 'is_faculty',
    type: types.sqliteType.INTEGER,
    defaultValue: '0'
  }
};

export class UserModel extends Model<UserRecord> {
  constructor(db: sqlite) {
    super(db, TABLE_NAME, FIELDS);
  }
}
