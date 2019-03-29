import * as types from '../types';

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
