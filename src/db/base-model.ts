import sqlite from 'better-sqlite3';
import * as types from './types';
import * as defaultFn from './base-model-fn';

/**
 * Random ideas
 * - meta property --> store create table schema
 * - logs property --> all the queries that were executed?
 */

export function initBaseModel(db: sqlite) {
  const baseModel = {
    get primaryKey() {
      for (const field in this.fields) {
        if (this.fields[field].isPrimaryKey) {
          return `${field}`;
        }
      }
      throw new Error('No primary key found');
    }
  };

  // Add the default functions:
  const isPrivateRegex = /^__/g;
  Object.keys(defaultFn).forEach(fnName => {
    if (!isPrivateRegex.test(fnName)) {
      Object.defineProperty(baseModel, fnName, {
        // value: defaultFn[fnName]
        value() {
          const { queryStr, method } = defaultFn[fnName];
        }
      });
    }
  });

  Object.defineProperty(baseModel, 'db', {
    value: db,
    // NOTE: means that db can't be rewritten for obj downstream of proto-chain
    writable: false
  });

  Object.defineProperty(baseModel, 'addQuery', {
    value: registerCustomQuery,
    writable: false
  });

  return baseModel;
}

// ============ default fn
function registerCustomQuery(queryName, fn: (...argument) => string) {
  Object.defineProperty(this, queryName, {
    value() {
      console.log(this);
      console.log('this from inside function');
      const qStr = fn(...arguments);
      const query = this.db.prepare(qStr);
      const result = query.exec();
      return result;
    }
  });
}

// ====== Testing =====
