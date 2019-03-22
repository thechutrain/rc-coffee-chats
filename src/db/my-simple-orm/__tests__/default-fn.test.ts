import { find } from '../default-fn';
import * as types from '../my-orm-types';

interface ITestCtx {
  tableName: string;
  fields: types.fields;
}
describe('FIND fn', () => {
  it('should select * from table with no arguments', () => {
    const ctx = {
      tableName: 'User'
    };

    const sqlStr = find.call(ctx, {});
    expect(sqlStr).toBe('SELECT * FROM User');
  });

  it('should not be able to modify Attrs to select, Where if they are existing fields', () => {
    const ctx: ITestCtx = {
      tableName: 'User',
      fields: {
        id: {
          type: 'INTEGER'
        }
      }
    };

    const sqlStr_1 = find.call(ctx, { where: { id: 2 } });
    expect(sqlStr_1).toBe('SELECT * FROM User WHERE id = @id');

    const sqlStr_2 = find.call(ctx, { attrs: ['id'] });
    expect(sqlStr_2).toBe('SELECT id FROM User');
  });
});

// describe('MyORM: base-model class test', () => {
//   it('FIND fn: should select * from find fn', () => {
//     const ctx = {
//       tableName: 'User'
//     };

//     const sqlStr = find.call(ctx, {});
//     expect(sqlStr).toBe('SELECT * FROM User');
//   });
// });
