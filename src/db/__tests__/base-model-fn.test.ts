import {
  find,
  add,
  update,
  remove,
  count,
  __getPrimaryKey,
  __validateQueryArgs
} from '../base-model-fn';

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

describe('Base Model Fn: add()', () => {
  xit('should throw an error if no query args provided', () => {
    const ctx = defaultCtx;
    let error = null;
    let sqlStr;

    try {
      sqlStr = add.call(ctx, {});
    } catch (e) {
      error = e;
    }
    // expect(sqlStr).toBe('');
    expect(error).not.toBeNull();
  });
  xit('should be able to create a string for adding a new record', () => {
    const ctx = defaultCtx;

    const sqlStr = add.call(ctx, {});
    // expect(sqlStr).toBe('');
  });
  it('should create the proper add query for one column or multiple columns', () => {
    const ctx = defaultCtx;

    const addSql = add.call(ctx, { username: 'alan' });
    const trimmedSqlStr = addSql.replace(/\s+/g, ' ').trim();
    expect(trimmedSqlStr).toEqual(
      'INSERT INTO User ( username ) VALUES ( @username )'
    );
  });
});

describe('Base Model Fn: update()', () => {
  it('should not be able to update with an empty where arg', () => {
    const ctx = defaultCtx;
    let error = null;
    try {
      update.call(ctx, { username: 'al' }, {});
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
    expect(error.message).toBe(
      'Must specify at least one field for the where argument'
    );
  });

  it('should be able to create an update string for a single where attribute', () => {
    const ctx = defaultCtx;
    const updateStr = update.call(
      ctx,
      { username: 'al' },
      { username: 'alan', age: 22 }
    );
    const trimSqlStr = updateStr.replace(/\s+/g, ' ').trim();
    expect(trimSqlStr).toEqual(
      'UPDATE User SET username = @username WHERE username = @username AND age = @age'
    );
  });

  it('should be able to create an update string for multiple where attribute', () => {
    const ctx = defaultCtx;
    const updateStr = update.call(
      ctx,
      { username: 'al' },
      { username: 'alan' }
    );
    const trimSqlStr = updateStr.replace(/\s+/g, ' ').trim();
    expect(trimSqlStr).toEqual(
      'UPDATE User SET username = @username WHERE username = @username'
    );
  });
});

describe('Base Model Fn: remove()', () => {
  it('should throw an error with an empty where arg', () => {
    const ctx = defaultCtx;
    let error = null;
    try {
      remove.call(ctx, {});
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
    expect(error.message).toBe(
      'Must specify at least one field for the where argument'
    );
  });

  it('should be able to create an remove string for a single where attribute', () => {
    const ctx = defaultCtx;
    const removeStr = remove.call(ctx, { username: 'al' });
    const trimSqlStr = removeStr.replace(/\s+/g, ' ').trim();
    expect(trimSqlStr).toEqual('DELETE FROM User WHERE username = @username');
  });

  it('should be able to create an remove string for multiple where attribute', () => {
    const ctx = defaultCtx;
    const removeStr = remove.call(ctx, { username: 'al', age: 18 });
    const trimSqlStr = removeStr.replace(/\s+/g, ' ').trim();
    expect(trimSqlStr).toEqual(
      'DELETE FROM User WHERE username = @username AND age = @age'
    );
  });
});

describe('Base Model Fn: count()', () => {
  it('should be able to generate a count string', () => {
    const ctx = defaultCtx;

    const countStr = count.call(ctx);
    const trimCountSql = countStr.replace(/\s+/g, ' ').trim();
    expect(trimCountSql).toBe('SELECT COUNT(id) FROM User');
  });
});

describe('Base Model Fn: getPrimaryKey()', () => {
  it('should be able to get the primary key', () => {
    const ctx = defaultCtx;

    const primaryKey = __getPrimaryKey(ctx.fields);
    expect(primaryKey).toBe('id');
  });
  it('should throw an error if more than one primary key', () => {
    const ctx = {
      tableName: 'User',
      fields: {
        id: {
          colName: 'id',
          type: types.sqliteType.INTEGER,
          meta: {
            isPrimaryKey: true
          }
        },
        username: {
          colName: 'username',
          type: types.sqliteType.TEXT,
          meta: {
            isPrimaryKey: true
          }
        }
      }
    };
    let error = null;
    try {
      __getPrimaryKey(ctx.fields);
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(error.message).toBe(
      'There must be only one primary key for each table'
    );
  });
  xit('should throw an error if no primary key', () => {
    expect(false).toBe(true);
  });
});
// TODO: revisit the validateQueryArgs()
xdescribe('Base Model Fn: __validateQueryArgs()', () => {
  it('should not throw an error if no query args provided', () => {
    const ctx = defaultCtx;
    let error = null;
    try {
      // __validateQueryArgs.call(ctx, {});
      __validateQueryArgs(ctx.tableName, ctx.fields, {});
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });

  it('should not throw an error for query args that are valid', () => {
    const ctx = defaultCtx;
    let error = null;
    try {
      __validateQueryArgs(ctx.tableName, ctx.fields, {
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
      __validateQueryArgs(ctx.tableName, ctx.fields, {
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
      __validateQueryArgs(ctx.tableName, ctx.fields, queryArgs, [
        'isPrimaryKey'
      ]);
      // __validateQueryArgs.call(ctx, queryArgs, ['isPrimaryKey']);
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
