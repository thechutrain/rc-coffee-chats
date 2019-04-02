import sqlite from 'better-sqlite3';
import * as types from './dbTypes';

export abstract class Model {
  static db: sqlite;
  protected abstract tableName: string; // ex. User
  protected abstract fields: types.fieldListing;

  constructor(db?: sqlite) {
    if (!Model.db && !db) {
      throw new Error('Must provide db');
    } else if (!Model.db) {
      Model.db = db;
    }
  }

  get primaryKey(): string {
    const primaryKeyArr = Object.keys(this.fields).filter(
      fieldStr => this.fields[fieldStr].meta.isPrimaryKey
    );

    if (primaryKeyArr.length !== 1) {
      throw new Error('There must be only one primary key for each table');
    }

    return primaryKeyArr[0];
  }

  get foreignKeys(): string[] {
    return Object.keys(this.fields).filter(s => this.fields[s].foreignKey);
  }

  public createTable(): types.IQueryResult {
    // 1) Validate that we can make a new table
    if (!Model.db) {
      throw new Error(`No database intialized`);
    }

    if (!this.fields || !this.tableName) {
      throw new Error(
        'need to have tableName, fields, relations on child class'
      );
    }

    const queryBodyArr: string[] = [];
    // 2) Get each field pertaining to column, ex. username TEXT NOT NULL,
    Object.keys(this.fields).forEach(field => {
      const {
        type,
        meta: { isPrimaryKey, isUnique, isNotNull, isDefault },
        defaultValue
      } = this.fields[field];
      let fieldStr = `${field} ${type}`;
      if (isPrimaryKey) {
        fieldStr = fieldStr + ' PRIMARY KEY';
      }
      if (isUnique) {
        fieldStr = fieldStr + ' UNIQUE';
      }
      if (isNotNull) {
        fieldStr = fieldStr + ' NOT NULL';
      }
      if (isDefault && defaultValue !== '') {
        fieldStr = fieldStr + ' DEFAULT ' + defaultValue;
      }

      queryBodyArr.push(fieldStr);
    });

    if (queryBodyArr.length === 0) {
      throw new Error('Must have at least one field in the table');
    }

    for (const fieldStr in this.fields) {
      const field = this.fields[fieldStr];
      if (field.hasOwnProperty('foreignKey')) {
        const fkField = this.fields[fieldStr];
        const { refTable, refColumn } = fkField.foreignKey;

        queryBodyArr.push(
          `FOREIGN KEY (${fieldStr}) REFERENCES ${refTable} (${refColumn})
          ON DELETE CASCADE ON UPDATE NO ACTION`
        );
      }
    }

    const queryBody = queryBodyArr.join(',\n');
    const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
${queryBody})`;

    try {
      Model.db.exec(query);
    } catch (e) {
      return {
        error: e,
        rawQuery: query
      };
    }

    return {
      rawQuery: query
    };
  }

  /**
   * simple validation that ensures all queryArgs exist as column/fields & runs isValideFn
   * NOTE: not really necessary since sqlite3 will throw us an error :)
   * @param queryArgs
   */
  // NOTE: can pass in function.name && tableName too
  public __validateQueryArgs(queryArgs = {}, noPrimaryKey = true): void {
    for (const argKey in queryArgs) {
      if (!Object.prototype.hasOwnProperty.call(this.fields, argKey)) {
        // ErrorType: extra arg that is not related to any field
        throw new Error(
          `add a new record was provided a key of "${argKey}" that is not associated with any field on the table "${
            this.tableName
          }"`
        );
      }

      const { isValidFn } = this.fields[argKey];

      if (isValidFn && !isValidFn(queryArgs[argKey])) {
        // ErrorType: arg failed validation
        throw new Error(
          `provided argument of "${queryArgs[argKey]}" failed validation`
        );
      }
    }

    // ===== Ensure no primary keys ======
    // TODO: FIX: right now it is checking to see if all required fields
    // are in the queryARgs (notNull values)! useful for creation but not updating
    if (false) {
      // 1) figure out what the required params are:
      // Map through the Fields & filter for
      // fields that are isNotNull == true && isPrimaryKey == false
      const reqFields = Object.keys(this.fields).filter(field => {
        const { isPrimaryKey, isNotNull } = this.fields[field].meta;
        // Note: since primary key will autoincrement, never allow users to
        // specify primary key when adding a new record
        return isPrimaryKey ? false : isNotNull;
      });

      // 2) determine that the given args has those required params
      for (const field of reqFields) {
        if (!Object.prototype.hasOwnProperty.call(queryArgs, field)) {
          // ErrorType: missing required field
          throw new Error(
            `cannot add a new record in table "${
              this.tableName
            }" because you are missing an argument of "${field}"`
          );
        }
      }
    }
  }

  public find(
    queryArgs = {}
  ): { rawQuery: string; queryData?: any[]; error?: string } {
    this.__validateQueryArgs(queryArgs, false);
    const { db } = Model;

    let queryStr;
    if (Object.keys(queryArgs).length === 0) {
      queryStr = `SELECT * FROM ${this.tableName}`;
    } else {
      const whereArr = Object.keys(queryArgs).map(f => `${f} = @${f}`);
      queryStr = `SELECT * from ${this.tableName} WHERE ${whereArr.join(
        ' AND '
      )}`;
    }

    const queryStmt = db.prepare(queryStr);
    let queryData;

    try {
      queryData = queryStmt.all(queryArgs);
    } catch (e) {
      return {
        rawQuery: queryStr,
        error: e
      };
    }
    return {
      rawQuery: queryStr,
      queryData
    };
  }

  public add(
    queryArgs = {}
  ): {
    rawQuery: string;
    queryData?: { changes: number; lastInsertROWID: number };
    error?: string;
  } {
    this.__validateQueryArgs(queryArgs, true);
    const { db } = Model;

    const fields = Object.keys(queryArgs);
    const fieldPlaceholder = fields.map(f => `@${f}`);

    const queryStr = `INSERT INTO ${this.tableName} (
      ${fields.join(', ')}
      ) VALUES (
      ${fieldPlaceholder.join(', ')}
      )`;

    const query = db.prepare(queryStr);
    try {
      const result = query.run(queryArgs);
      return {
        rawQuery: queryStr,
        queryData: result
      };
    } catch (e) {
      return {
        rawQuery: queryStr,
        error: e
      };
    }
  }

  public update(
    updateArgs = {},
    whereArgs = {}
  ): {
    rawQuery: string;
    queryData?: { changes: number };
    error?: string;
  } {
    const { db } = Model;
    this.__validateQueryArgs(updateArgs, false);

    // Check that there are valid records to update
    const { queryData } = this.find(whereArgs);
    if (queryData.length === 0) {
      throw new Error('Found no records to update');
    }

    const recordsByPrmKey: string[] = queryData.map(record => {
      return record[this.primaryKey];
    });
    // console.log(recordsByPrmKey);

    const updateBody = Object.keys(updateArgs).map(
      colStr => `${colStr} = @${colStr}`
    );
    const updateStr = `UPDATE ${this.tableName} SET
    ${updateBody.join(', ')}
    WHERE ${this.primaryKey} = @${this.primaryKey}`;
    // console.log(updateStr);

    const update = db.prepare(updateStr);
    let changes = 0;

    // Source: https://github.com/JoshuaWise/better-sqlite3/issues/49
    const begin = db.prepare('BEGIN');
    const commit = db.prepare('COMMIT');
    const rollback = db.prepare('ROLLBACK');
    begin.run();
    try {
      for (const prmKey of recordsByPrmKey) {
        const sqlArgs = { ...updateArgs, [this.primaryKey]: prmKey };

        update.run(sqlArgs);
        changes += 1;
      }
      commit.run();
    } catch (e) {
      const errMsg = `could not run bulk update \n ${e}`;
      // console.warn(errMsg);

      rollback.run();
      return {
        rawQuery: updateStr,
        error: e
      };
    }

    return {
      rawQuery: updateStr,
      queryData: { changes }
    };
  }

  // TODO:
  // public remove(queryArgs = {}) {
  //   // TODO:
  // }

  public count(): { rawQuery: string; queryData: number } {
    const queryStr = `SELECT COUNT(id) FROM ${this.tableName}`;
    const countQuery = Model.db.prepare(queryStr);

    const { 'COUNT(id)': numRecord } = countQuery.get();

    return { rawQuery: queryStr, queryData: numRecord };
  }
}
