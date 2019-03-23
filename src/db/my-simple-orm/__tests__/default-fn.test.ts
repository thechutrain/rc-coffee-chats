import { find, __validateQueryArgs } from '../default-fn';
import * as types from '../my-orm-types';

interface ITestCtx {
  tableName: string;
  fields: types.fields;
}

let defaultCtx: ITestCtx;
beforeEach(() => {
  defaultCtx = {
    tableName: 'User',
    fields: {
      id: {
        type: 'INTEGER',
        isPrimaryKey: true,
        isNotNull: true,
        isUnique: true
      },
      username: {
        type: 'TEXT',
        isUnique: true,
        isNotNull: true
      },
      name: {
        type: 'TEXT',
        isNotNull: true
      },
      age: {
        type: 'INTEGER'
      }
    }
  };
});

describe('Base Model Fn: find()', () => {
  it('should select * from table with no arguments', () => {
    const ctx = defaultCtx;

    const sqlStr = find.call(ctx, {});
    expect(sqlStr).toBe('SELECT * FROM User');
  });

  it('should not be able to modify Attrs to select, Where if they are existing fields', () => {
    const ctx: ITestCtx = defaultCtx;

    const sqlStr_1 = find.call(ctx, { where: { id: 2 } });
    expect(sqlStr_1).toBe('SELECT * FROM User WHERE id = @id');

    const sqlStr_2 = find.call(ctx, { attrs: ['id'] });
    expect(sqlStr_2).toBe('SELECT id FROM User');
  });
});

describe('Base Model Fn: __validateQueryArgs()', () => {
  it('should not throw errors if no query args provided', () => {
    const ctx = defaultCtx;
    let error = null;
    try {
      __validateQueryArgs.call(ctx, {});
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });

  it('should not throw errors for query args that are valid', () => {
    const ctx = defaultCtx;
    let error = null;
    try {
      __validateQueryArgs.call(ctx, {
        id: 1
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
});
