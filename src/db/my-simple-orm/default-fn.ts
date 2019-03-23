/**
 * smallest unit for each of the
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

export function __validateQueryArgs(queryArgs: any = {}) {
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
}
