import * as types from './types';
/**
 * Default Functions of the default Model
 * Note: "this" has to implement the types.ISchema interface
 * @param queryArgs
 */

export function find(queryArgs: { attrs?: string[]; where?: any }) {
  let queryStr;
  const { attrs, where } = queryArgs;
  const attrStr = attrs && attrs.length !== 0 ? attrs.join(', ') : '*';

  if (!where) {
    queryStr = `SELECT ${attrStr} FROM ${this.tableName}`;
  } else {
    const whereBody = Object.keys(where).map(w => `${w} = @${w}`);
    queryStr = `SELECT ${attrStr} FROM ${this.tableName} WHERE ${whereBody}`;
  }

  // console.log(queryStr);
  return queryStr;
}

export function __validateQueryArgs(
  queryArgs: any = {},
  excludeMeta: types.filterableMetaFields[] = []
) {
  // Ensure that the keys in query arg are valid fields:
  for (const queryKey in queryArgs) {
    if (!Object.prototype.hasOwnProperty.call(this.fields, queryKey)) {
      // ErrorType: extra arg that is not related to any field
      throw new Error(
        `failed query argument validation. Query function was passed a key of "${queryKey}" that is not associated with any column on the table "${
          this.tableName
        }"`
      );
    }
  }

  // Get all the colFields that we should exclude
  // & ensure they aren't in queryArgs
  if (excludeMeta.length === 0) return;

  const fieldsToExclude: any[] = [];
  for (const field in this.fields) {
    const { meta, colName } = this.fields[field] as types.IField;
    for (const metaProperty in meta) {
      // console.log(metaProperty);
      if (
        excludeMeta.indexOf(metaProperty as types.filterableMetaFields) !== -1
      ) {
        fieldsToExclude.push(colName);
      }
    }
  }
  // console.log(fieldsToExclude);

  // Check that none of the queryArgs provided belong on the fieldsToExclude
  Object.keys(queryArgs).forEach(queryKey => {
    const foundIndex = fieldsToExclude.indexOf(queryKey);
    if (foundIndex !== -1) {
      throw new Error(
        `${queryKey} was found in the fields that should be excluded`
      );
    }
  });
}

// ===== testing ===
// const defaultCtx: types.ISchema = {
//   tableName: 'User',
//   fields: {
//     id: {
//       colName: 'id',
//       type: types.sqliteType.INTEGER,
//       meta: {
//         isPrimaryKey: true,
//         isNotNull: true,
//         isUnique: true
//       }
//     },
//     username: {
//       colName: 'username',
//       type: types.sqliteType.TEXT,
//       meta: {
//         isUnique: true,
//         isNotNull: true
//       }
//     },
//     age: {
//       colName: 'age',
//       type: types.sqliteType.INTEGER,
//       meta: {}
//     }
//   }
// };

// __validateQueryArgs.call(defaultCtx, { id: 3 }, ['isPrimaryKey']);
