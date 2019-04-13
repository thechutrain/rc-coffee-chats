import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { WEEKDAY } from '../../types';
import { Model } from './base_model';

export class UserModel extends Model<UserRecord> {
  constructor(db: sqlite) {
    super(db, TABLE_NAME, FIELDS);
    this.initTable();
  }

  // NOTE: current default create() in the Model does not take into account
  // any database constraints (CHECK) this could be a TODO?
  public initTable(): { rawQuery: string } {
    const rawQuery = `CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        coffee_days TEXT DEFAULT 1234,
        skip_next_match INTEGER DEFAULT 0,
        warning_exception INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        is_faculty INTEGER DEFAULT 0,
        CHECK (is_faculty in (0,1)),
        CHECK (is_active in (0,1)),
        CHECK (skip_next_match in (0,1)),
        CHECK (warning_exception in (0,1))
      )`;

    const createStmt = Model.db.prepare(rawQuery);
    createStmt.run();

    return { rawQuery };
  }

  // ================== FIND ====================
  public findByEmail(email: string): UserRecord {
    const results = this.find({ email });
    if (results.length === 0) {
      throw new Error(`Could not find a user with the email: ${email}`);
    }
    return results[0];
  }

  public findById(id: number): UserRecord | null {
    const results = this.find({ id });
    return results.length ? results[0] : null;
  }

  public findMatchesByDay(weekday?: WEEKDAY) {
    const matchDayInt = weekday !== undefined ? weekday : new Date().getDay();
    //   const findMatches = Model.db.prepare(`
    //   SELECT U.*, count (UM.user_id) as num_matches FROM User U
    //     LEFT JOIN User_Match UM
    //     ON U.id = UM.user_id
    //     LEFT JOIN Match M
    //     ON UM.match_id = M.id
    //     WHERE U.coffee_days LIKE '%${matchDayInt}%'
    //     AND U.skip_next_match <> 1
    //     GROUP BY UM.user_id
    //     ORDER BY num_matches desc
    // `);
    const findMatches = Model.db.prepare(`
    SELECT U.*,  U.id as u_id, count (UM.user_id) as num_matches, M.id as mid FROM User U
    LEFT JOIN User_Match UM
    ON U.id = UM.user_id
    LEFT JOIN Match M
    ON UM.match_id = M.id
    WHERE U.coffee_days LIKE '%${matchDayInt}%'
    AND U.skip_next_match <> 1
    GROUP BY UM.user_id
    ORDER BY num_matches desc
    `);

    return findMatches.all();
  }

  /**
   * - gets all previous matches with active users who are also being paired today
   * @param user_id
   * @param weekday
   */
  public findPrevMatches(user_id: number, weekday: WEEKDAY) {
    const prevMatchesQuery = Model.db.prepare(`
    SELECT U.id, U.email, U.full_name, Match.date
    FROM User U
    LEFT Join User_Match
      ON U.id = User_Match.user_id
    LEFT JOIN Match
      ON User_Match.match_id = Match.id
    WHERE User_Match.user_id <> ${user_id}
    AND U.coffee_days LIKE '%${weekday}%'
    AND U.skip_next_match <> ${user_id}
    AND U.is_active <> 0
    AND User_Match.match_id in (
      SELECT Match.id
      FROM User
      LEFT JOIN User_Match
        ON User.id = User_Match.user_id
      LEFT JOIN Match
        ON User_Match.match_id = Match.id
      WHERE User.id = ${user_id}
     )
     ORDER BY Match.date
    `);

    return prevMatchesQuery.all();
  }

  // ================= UPDATE ===============
  public updateDays(email: string, weekdays: WEEKDAY[]) {
    const weekdayStr = weekdays
      .sort((a, b) => {
        if (a > b) {
          return 1;
        }
        if (b < a) {
          return -1;
        }
        return 0;
      })
      .join('');

    return this.update({ coffee_days: weekdayStr }, { email });
  }

  public updateWarnings(email: string, warnings: boolean) {
    const warning_exception = warnings ? '1' : '0';
    return this.update({ warning_exception }, { email });
  }

  public updateSkipNextMatch(email, skipNextMatch: boolean) {
    const skip_next_match = skipNextMatch ? '1' : '0';
    return this.update({ skip_next_match }, { email });
  }

  //   public getTodaysMatch(weekday?: WEEKDAY_SHORT) {
  //     const dayToSearch = weekday ? WEEKDAY_SHORT[weekday] : new Date().getDay();

  //     const sqlQuery = Model.db.prepare(
  //       `
  //     with todayMatches as (SELECT U.*,  U.id as u_id, count (UM.user_id) as num_matches, M.id as mid FROM User U
  //         LEFT JOIN User_Match UM
  //         ON U.id = UM.user_id
  //         LEFT JOIN Match M
  //         ON UM.match_id = M.id
  //         WHERE U.coffee_days LIKE '%${dayToSearch}%'
  //         AND U.skip_next_match <> 1
  //         GROUP BY UM.user_id
  //         ORDER BY num_matches desc),

  //     totalMatches as (select * from todayMatches TM2
  //         INNER JOIN User_Match UM2
  //         ON TM2.id = UM2.user_id
  //         INNER JOIN Match M2
  //         ON UM2.match_id = M2.id)
  //     SELECT * FROM totalMatches TM3
  //       INNER JOIN totalMatches TM4
  //       ON TM3.match_id = TM4.match_id
  //       AND TM3.user_id != TM4.user_id
  //       ORDER BY TM3.email, TM3.date
  //     `
  //     );

  //     return sqlQuery.all();
  //   }
}

export type UserRecord = {
  id: number;
  email: string;
  full_name: string;
  coffee_days: string; // NOTE: or the enum days?
  warning_exceptions: boolean;
  skip_next_match: boolean;
  is_active: boolean;
  is_faculty: boolean;
};

export const TABLE_NAME = 'User';
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
  email: {
    colName: 'email',
    type: types.sqliteType.TEXT,
    meta: {
      isUnique: true,
      isNotNull: true
    }
  },
  full_name: {
    colName: 'full_name',
    type: types.sqliteType.TEXT,
    meta: {
      isNotNull: true
    }
  },
  coffee_days: {
    colName: 'coffee_days',
    type: types.sqliteType.TEXT,
    meta: {
      defaultValue: '1234'
    }
  },
  skip_next_match: {
    colName: 'skip_next_match',
    type: types.sqliteType.INTEGER,
    meta: {
      defaultValue: '0'
    }
  },
  warning_exception: {
    colName: 'warning_exception',
    type: types.sqliteType.INTEGER,
    meta: {
      defaultValue: '0'
    }
  },
  is_active: {
    colName: 'is_active',
    type: types.sqliteType.INTEGER,
    meta: {
      defaultValue: '1'
    }
  },
  is_faculty: {
    colName: 'is_faculty',
    type: types.sqliteType.INTEGER,
    meta: {
      defaultValue: '0'
    }
  }
};
