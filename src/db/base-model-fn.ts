import * as types from './types';
/**
 * Default Functions of the default Model
 * Note: "this" has to implement the types.ISchema interface
 * @param queryArgs
 */

export function find(queryArgs: { attrs?: string[]; where?: any }): string {
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

export function add(queryArgs = {}): string {
  __validateQueryArgs(this.tableName, this.fields, queryArgs, ['isPrimaryKey']);

  const fields = Object.keys(queryArgs);
  const fieldPlaceholder = fields.map(f => `@${f}`);

  const queryStr = `INSERT INTO ${this.tableName} (
    ${fields.join(', ')}
    ) VALUES (
      ${fieldPlaceholder.join(', ')}
  )`;

  return queryStr;
}

export function update(updateArgs = {}, whereArgs = {}): string {
  // Validation:
  __validateQueryArgs(this.tableName, this.fields, updateArgs, [
    'isPrimaryKey'
  ]);
  __validateQueryArgs(this.tableName, this.fields, whereArgs);
  if (Object.keys(whereArgs).length === 0) {
    throw new Error('Must specify at least one field for the where argument');
  }

  // Build Update String:
  const updateBody = Object.keys(updateArgs).map(
    colStr => `${colStr} = @${colStr}`
  );
  const whereBody = Object.keys(whereArgs).map(
    colStr => `${colStr} = @${colStr}`
  );
  const updateStr = `UPDATE ${this.tableName} SET
  ${updateBody.join(', ')}
  WHERE ${whereBody.join(' AND ')}`;

  return updateStr;
}

export function count(): string {
  return '';
}

// export function remove(): string {}

export function getPrimaryKey(): string {
  const primaryKeyArr = Object.keys(this.fields).filter(
    fieldStr => this.fields[fieldStr].meta.isPrimaryKey
  );

  if (primaryKeyArr.length !== 1) {
    throw new Error('There must be only one primary key for each table');
  }

  return primaryKeyArr[0];
}

// TODO:
// validate the argument types?
/** Validates query arguments before making any SQL transactions:
 * - ensures you have valid fields/column names
 * -
 * @param queryArgs
 * @param excludeMeta
 */
export function __validateQueryArgs(
  tableName: string,
  fields: types.fieldListing = {},
  queryArgs: any = {},
  excludeMeta: types.filterableMetaFields[] = []
  // requiredFields: types.filterableMetaFields[] = []
) {
  // Note: instead of throwing an error for non-valid query args
  // you could just ignore invalid keys and return a validated obj?

  // Ensure that the keys in query arg are valid fields:
  for (const queryKey in queryArgs) {
    if (!Object.prototype.hasOwnProperty.call(fields, queryKey)) {
      // ErrorType: extra arg that is not related to any field
      throw new Error(
        `failed query argument validation. Query function was passed a key of "${queryKey}" that is not associated with any column on the table "${tableName}"`
      );
    }
  }

  // Get all the colFields that we should exclude
  // & ensure they aren't in queryArgs
  if (excludeMeta.length === 0) return;

  const fieldsToExclude: any[] = [];
  for (const field in fields) {
    // const { meta, colName } = fields[field] as types.IField;
    const { meta, colName } = fields[field];
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
        `"${queryKey}" was found in the fields that should be excluded`
      );
    }
  });
}
