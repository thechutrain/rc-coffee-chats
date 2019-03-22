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
