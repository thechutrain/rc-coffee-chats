import moment from 'moment';
import 'moment-timezone';
import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { WEEKDAY } from '../../types';
import { Model } from './__base_model';

export class UserModel extends Model<UserRecord> {
  constructor(db: sqlite) {
    super(db, TABLE_NAME, FIELDS);
    this.initTable();
  }

  // NOTE: current default create() in the Model does not take into account
  // any database constraints (CHECK) this could be an additional feature
  // for the base_model
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
        is_admin INTEGER DEFAULT 0,
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
  public emailExists(email: string): boolean {
    const results = this.find({ email });
    if (results.length > 1) {
      throw new Error(
        `Found more than one user with the given email: ${email}`
      );
    }

    return results.length === 1;
  }

  public findByEmail(email: string): UserRecord {
    const results = this.find({ email });
    if (results.length === 0) {
      throw new Error(`Could not find a user with the email: ${email}`);
    }
    return results[0];
  }

  public findById(id: number): UserRecord {
    const results = this.find({ id });
    if (results.length === 0) {
      throw new Error(`Could not find a user with the id: ${id}`);
    }
    return results[0];
  }

  public findActiveUsers(): UserRecord[] {
    const findStatement = Model.db.prepare(
      `SELECT * FROM User U WHERE U.is_active = 1`
    );
    return findStatement.all();
  }

  public findAdmins(): UserRecord[] {
    const findStatement = Model.db.prepare(
      `SELECT * FROM User U WHERE U.is_admin = 1`
    );
    return findStatement.all();
  }

  public isAdmin(idOrEmail: string | number): boolean {
    const user =
      typeof idOrEmail === 'string'
        ? this.findByEmail(idOrEmail)
        : this.findById(idOrEmail);

    return user.is_admin === 1;
  }

  public findPrevMatches(email: string): MatchRecord[] {
    const { id } = this.findByEmail(email);
    const findStatement = Model.db.prepare(`
    SELECT U.id, U.email, U.full_name, Match.date
    FROM User U
    LEFT Join User_Match
      ON U.id = User_Match.user_id
    LEFT JOIN Match
      ON User_Match.match_id = Match.id
    WHERE User_Match.user_id <> ${id} 
    AND User_Match.match_id in (
      SELECT Match.id
      FROM User
      LEFT JOIN User_Match
        ON User.id = User_Match.user_id
      LEFT JOIN Match
        ON User_Match.match_id = Match.id
      WHERE User.id = ${id}
     )
     ORDER BY Match.date DESC
     LIMIT 100  
    `);

    return findStatement.all();
  }

  /**
   * Finds the users who want to skip their next match
   * @param weekday
   */
  public _findSkippingUsers(weekday?: WEEKDAY): UserRecord[] {
    const matchDayInt: number =
      weekday !== undefined
        ? weekday
        : moment()
            .tz('America/New_York')
            .day();

    const findTodaysSkipped = Model.db.prepare(
      `SELECT * FROM User U WHERE U.coffee_Days LIKE '%${matchDayInt}%' and U.is_active <> 0 and U.skip_next_match = 1`
    );

    return findTodaysSkipped.all();
  }

  /** ✳️ Query userd for Warning Cron job
   *
   * Gets all the active users who are planning on being matched tomorrow and
   * dont have warning exceptions turned on
   * @param weekday
   */
  public findUsersNextDayMatchWarning(weekday?: number): UserRecord[] {
    const todayInt =
      weekday !== undefined
        ? weekday
        : moment()
            .tz('America/New_York')
            .day();
    const tomorrowInt = (todayInt + 1) % 7;

    const nextDayWarnings = Model.db.prepare(`SELECT *  
    FROM User U WHERE U.coffee_days LIKE '%${tomorrowInt}%' AND U.warning_exception = 0 AND U.skip_next_match <> 1 AND U.is_active = 1`);

    return nextDayWarnings.all();
  }

  /** ️✳️ Query used for Matchify cron
   * Finds all the users who want to be matched today and all of their previous matches
   * @param inputWeekday
   */
  // ✅: tests written
  public findUsersPrevMatchesToday(
    inputWeekday?: number
  ): UserWithPrevMatchRecord[] {
    const weekday: number =
      inputWeekday !== undefined
        ? inputWeekday
        : moment()
            .tz('America/New_York')
            .day();

    const usersToMatchToday = this._findUsersToMatch(weekday);

    return usersToMatchToday.map(user => {
      const prevMatches = this._findPrevActiveMatches(user.id, weekday);

      return {
        ...user,
        prevMatches
      };
    });
  }

  /**
   * Finds users who want to be matched for the given day, sorted by users who
   * have the most number of matches first.
   * @param weekday
   */
  // ✅: tests written
  public _findUsersToMatch(weekday?: number): UserWithPrevMatchRecord[] {
    const matchDayInt =
      weekday !== undefined
        ? weekday
        : moment()
            .tz('America/New_York')
            .day();

    const findMatches = Model.db.prepare(`
    with todayMatches as (SELECT U.id FROM User U WHERE U.coffee_days LIKE '%${matchDayInt}%' and U.is_active <> 0 and U.skip_next_match <> 1),

    prevMatches as (SELECT UM.user_id, count (UM.user_id) as num_matches from User_Match UM
    LEFT JOIN MATCH M
      ON UM.match_id = M.id
    INNER JOIN User_Match UM2
      ON UM2.match_id = M.id
     WHERE UM.user_id in todayMatches and UM2.user_id in todayMatches and UM.user_id != UM2.user_id
     group by um.user_id
     order by num_matches desc
     )

    SELECT U2.*, prevMatches.num_matches from User U2
      LEFT JOIN prevMatches
      ON prevMatches.user_id = U2.id
      WHERE U2.coffee_days LIKE '%${matchDayInt}%' and U2.is_active <> 0 and U2.skip_next_match <> 1;
    `);

    // NOTE: num_matches will be null if there are no prevmatches --> ensures num_matches
    // will be a number:
    return findMatches.all().map(userRecord => {
      return {
        ...userRecord,
        num_matches:
          userRecord.num_matches === null ? 0 : userRecord.num_matches
      };
    });
  }

  /**
   * - gets all previous matches with active users who are also being paired today
   * @param user_id
   * @param weekday
   */
  // ✅: tests written
  public _findPrevActiveMatches(
    user_id: number,
    weekday: WEEKDAY
  ): PrevMatchRecord[] {
    const prevMatchesQuery = Model.db.prepare(
      `
    SELECT U.id, U.email, U.full_name, Match.date
    FROM User U
    LEFT Join User_Match
      ON U.id = User_Match.user_id
    LEFT JOIN Match
      ON User_Match.match_id = Match.id
    WHERE User_Match.user_id <> ${user_id}
    AND U.coffee_days LIKE '%${weekday}%'
    AND U.skip_next_match <> 1
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
    `
    );

    return prevMatchesQuery.all();
  }

  // public findAllPrevMatches() { }

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

  public updateIsAdmin(email: string, shouldBeAdmin: boolean) {
    const is_admin = shouldBeAdmin ? '1' : '0';
    return this.update({ is_admin }, { email });
  }
  public updateSkipNextMatch(email, skipNextMatch: boolean) {
    const skip_next_match = skipNextMatch ? '1' : '0';
    return this.update({ skip_next_match }, { email });
  }

  // ✅: tests written
  public clearTodaysSkippers(weekday?: WEEKDAY) {
    const weekdayInt: number =
      weekday !== undefined
        ? weekday
        : moment()
            .tz('America/New_York')
            .day();
    const updateQuery = Model.db
      .prepare(`with todaysSkipped as (SELECT U.id FROM User U WHERE U.coffee_Days LIKE '%${weekdayInt}%' and U.is_active <> 0 and U.skip_next_match = 1)

    UPDATE User SET skip_next_match = 0 WHERE User.id in todaysSkipped;`);

    return updateQuery.run();
  }
}

// TODO: how can I make this UserRecord a type that
// gets all its keys from the FIELDS?
export type UserWithPrevMatchRecord = UserRecord & {
  prevMatches: PrevMatchRecord[];
} & {
  num_matches: number;
};

export type UserRecord = {
  id: number;
  email: string;
  full_name: string;
  coffee_days: string; // NOTE: or the enum days?
  warning_exception: number; // NOTE: todo, add a sqlite type of bool, that will convert them to be an actual boolean in JS
  skip_next_match: number;
  is_active: number;
  is_faculty: number;
  is_admin: number;
};

export type MatchRecord = {
  id: number;
  email: string;
  full_name: string;
  date: string;
};

export type PrevMatchRecord = {
  id: number;
  email: string;
  full_name: string;
  date: string;
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
