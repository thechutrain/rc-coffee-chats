/**
 * TODO: scaffold db.prepare && db.exec()
 * TODO: add schema
 */

import * as types from '../dbTypes';
import { Model } from '../model';

const fakeDb = {
  prepare() {
    return {
      run() {
        return 'run() was called';
      }
    };
  },
  exec() {
    return 'exec() was called';
  }
};

const TABLE_NAME = 'ModelTest';
const FIELDS: types.fieldListing = {
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
  }
};

describe('Db base model: create()', () => {
  /**
   * 1) can't create a table without at least one field
   * 2) creates correct string from a schema with two fields
   */
  it('should not be able to create a model without a schema', () => {});
});

// describe('Db base model: create()', () => {
//   /**
//    * 1) can't create a table without at least one field
//    * 2) creates correct string from a schema with two fields
//    */
//   it('should have created a new table without any records', () => {
//     // const numUsers = User.count();
//     // expect(numUsers).toBe(0);
//   });
// });
