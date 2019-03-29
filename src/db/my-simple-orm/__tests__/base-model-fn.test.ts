import { find, __validateQueryArgs } from '../base-model-fn';
import * as types from '../types';

let defaultCtx: types.ISchema;
beforeEach(() => {
  defaultCtx = {
    tableName: 'User',
    fields: {
      id: {
        colName: 'id',
        type: types.sqliteType.INTEGER,
        meta: {
          isPrimaryKey: true,
          isNotNull: true,
          isUnique: true
        }
      },
      username: {
        colName: 'username',
        type: types.sqliteType.TEXT,
        meta: {
          isUnique: true,
          isNotNull: true
        }
      },
      age: {
        colName: 'age',
        type: types.sqliteType.INTEGER,
        meta: {}
      }
    }
  };
});

describe('Base Model Fn: find()', () => {
  it('should create "select * from [table]" str when not given args', () => {
    const ctx = defaultCtx;

    const sqlStr = find.call(ctx, {});
    expect(sqlStr).toBe('SELECT * FROM User');
  });

  it('should be able to create select string for specified attributes', () => {
    const ctx = defaultCtx;

    const sqlStr_1 = find.call(ctx, { where: { id: 2 } });
    expect(sqlStr_1).toBe('SELECT * FROM User WHERE id = @id');

    const sqlStr_2 = find.call(ctx, { attrs: ['id'] });
    expect(sqlStr_2).toBe('SELECT id FROM User');
  });

  it('should throw an error when trying to select a column field that does not exist on the given table', () => {
    // TODO:
  });
});

describe('Base Model Fn: __validateQueryArgs()', () => {
  it('should not throw an error if no query args provided', () => {
    const ctx = defaultCtx;
    let error = null;
    try {
      __validateQueryArgs.call(ctx, {});
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });

  it('should not throw an error for query args that are valid', () => {
    const ctx = defaultCtx;
    let error = null;
    try {
      __validateQueryArgs.call(ctx, {
        id: 1,
        username: 'validname'
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });

  it('should throw an error for non valid query args', () => {
    const ctx = defaultCtx;
    let error = null;

    try {
      __validateQueryArgs.call(ctx, {
        nononno: 'this key does not exist'
      });
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
  });

  it('should throw an error if it bans filterableMetaField that is provided', () => {
    const ctx = defaultCtx;
    let error = null;
    const queryArgs = { id: 1 };

    try {
      __validateQueryArgs.call(ctx, queryArgs, ['isPrimaryKey']);
      // __validateQueryArgs.bind(ctx)(queryArgs, ['isPrimaryKey']);
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
    expect(error.message).toBe(
      '"id" was found in the fields that should be excluded'
    );
  });
});
