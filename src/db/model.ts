import sqlite from 'better-sqlite3';
import * as types from './dbTypes';

export abstract class Model {
  protected abstract tableName: string; // ex. User
  protected db;
  protected abstract fields: types.fields;

  constructor(db) {
    this.db = db;

    return this;
  }
  public count(): number {
    const countQuery = this.db.prepare(
      `SELECT COUNT(id) FROM ${this.tableName}`
    );

    const { 'COUNT(id)': numRecord } = countQuery.get();

    return numRecord;
  }

  public abstract createTable();
}
