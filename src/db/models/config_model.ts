import * as sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { Model } from './__base_model';
import { UserMatchModel } from './usermatch_model';
import { UserModel } from './user_model';

const TABLE_NAME = 'Config';
const FIELDS: types.fieldListing = {
  id: {
    colName: 'id',
    type: types.sqliteType.INTEGER,
    meta: {
      isPrimaryKey: true,
      isNotNull: true,
      isUnique: true
    }
  },
  key: {
    colName: 'key',
    type: types.sqliteType.TEXT
  },
  value: {
    colName: 'value',
    type: types.sqliteType.BLOB,
    meta: {
      isPrimaryKey: true,
      isNotNull: true,
      isUnique: true
    }
  }
};

export class ConfigModel extends Model<ConfigRecord> {
  User: UserModel;

  constructor(db: sqlite.Database) {
    super(db, TABLE_NAME, FIELDS);
    this.initTable();
    this.User = new UserModel(db);
  }

  public initTable(): { rawQuery: string } {
    const rawQuery = `CREATE TABLE IF NOT EXISTS Config (
      id INTEGER PRIMARY KEY NOT NULL UNIQUE,
      key TEXT NOT NULL UNIQUE,
      value BLOB
    )`;

    const createStmt = Model.db.prepare(rawQuery);
    createStmt.run();

    return { rawQuery };
  }

  public addConfig(key: string, value: any) {
    const query = Model.db.prepare(
      `INSERT or REPLACE INTO Config(key, value) values (?, ?)`
    );

    query.run([key, value]);
  }

  public findConfig(key: string): ConfigRecord {
    const results = this.find({ key });
    if (!results.length) {
      throw new Error(`Column ${key} does not exist!`);
    }
    return results[0];
  }

  public setFallBackUser(email: string) {
    const user = this.User.findByEmail(email);
    this.addConfig('fallBackUserEmail', user.email);
  }

  public getFallBackUser(): null | any {
    const records = this.find({ key: 'fallBackUserEmail' });

    if (records.length === 0) {
      return null;
    }
    return records[0].value;
  }
}

type ConfigRecord = {
  key: string;
  value: any;
};
