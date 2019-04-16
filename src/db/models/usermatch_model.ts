import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { Model } from './__base_model';
import { UserModel, MatchModel } from '.';

export class UserMatchModel extends Model<UserMatchRecord> {
  private User: UserModel;
  private Match: MatchModel;

  constructor(db: sqlite, userM: UserModel, matchM: MatchModel) {
    super(db, TABLE_NAME, FIELDS);
    this.User = userM;
    this.Match = matchM;
    this.initTable();
  }

  public initTable(): { rawQuery: string } {
    const rawQuery = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
      id INTEGER PRIMARY KEY NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES User (id)
      ON DELETE CASCADE ON UPDATE NO ACTION,
      FOREIGN KEY (match_id) REFERENCES Match (id)
      ON DELETE CASCADE ON UPDATE NO ACTION
    )`;

    const createStmt = Model.db.prepare(rawQuery);
    createStmt.run();

    return { rawQuery };
  }

  public addNewMatch(user_ids: number[], inputDate?: string) {
    // Create the Match Record
    const date = inputDate ? inputDate : new Date().toISOString().split('T')[0];
    const { lastInsertRowid } = this.Match.add({ date });

    const insertQuery = Model.db.prepare(
      `INSERT INTO ${
        this.tableName
      } (user_id, match_id) VALUES (@user_id, @match_id)`
    );

    const insertMany = Model.db.transaction(ids => {
      for (const user_id of ids) {
        insertQuery.run({
          user_id: `${user_id}`,
          match_id: `${lastInsertRowid}`
        });
      }
    });

    insertMany(user_ids);
  }
}

export type UserMatchRecord = {
  id: number;
  user_id: number;
  match_id: number;
};

export const TABLE_NAME = 'User_Match';

export const FIELDS: types.fieldListing = {
  id: {
    colName: 'id',
    type: types.sqliteType.INTEGER,
    meta: {
      isPrimaryKey: true,
      isNotNull: true,
      isUnique: true
    }
  },
  user_id: {
    colName: 'user_id',
    type: types.sqliteType.INTEGER,
    meta: {
      isNotNull: true
    }
  },
  match_id: {
    colName: 'match_id',
    type: types.sqliteType.INTEGER,
    meta: {
      isNotNull: true
    }
  }
};
