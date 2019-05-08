import { Client } from 'pg';
import { UserRecord, UserWithPrevMatchRecord } from '../schema';
import { WEEKDAY } from '../../types';

export class User {
  db: Client;
  constructor(db: Client) {
    this.db = db;
  }

  public async initTable(): Promise<void> {
    await this.db.query(`CREATE TABLE "User" (
      id SERIAL PRIMARY KEY NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      coffee_days TEXT DEFAULT 1234,
      skip_next_match BOOLEAN DEFAULT false,
      warning_notification BOOLEAN DEFAULT true,
      is_active BOOLEAN DEFAULT true,
      is_faculty BOOLEAN DEFAULT false,
      is_admin BOOLEAN DEFAULT false
    )`);
  }

  public async emailExists(email: string): Promise<boolean> {
    const results = await this.db.query(
      `SELECT * FROM "User" WHERE EMAIL = $1`,
      [email]
    );
    return results.rowCount === 1;
  }

  public async findByEmail(email: string): Promise<UserRecord> {
    const results = await this.db.query(
      `SELECT * FROM "User" WHERE EMAIL = $1`,
      [email]
    );
    if (results.rowCount !== 1) {
      throw new Error(`Could not find a user with the email: ${email}`);
    }
    return results.rows[0];
  }

  public async add(email: string, full_name: string): Promise<UserRecord> {
    const result = await this.db.query(
      `INSERT INTO "User" (email, full_name) VALUES ($1, $2) RETURNING *`,
      [email, full_name]
    );

    return result.rows[0];
  }

  public async updateDays(email: string, days: WEEKDAY[]): Promise<void> {
    const weekdayStr = days
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

    await this.db.query(`UPDATE "User" SET coffee_days = $1 WHERE email = $2`, [
      weekdayStr,
      email
    ]);
    return;
  }

  public async updateWarnings(
    email: string,
    shouldSkip: boolean
  ): Promise<void> {
    await this.db.query(
      `UPDATE "User" SET warning_notification = $1 WHERE email = $2`,
      [shouldSkip, email]
    );
    return;
  }

  public async updateActive(email: string, isActive: boolean): Promise<void> {
    await this.db.query(`UPDATE "User" SET is_active = $1 WHERE email = $2`, [
      isActive,
      email
    ]);
    return;
  }

  public async updateSkip(email: string, skip: boolean): Promise<void> {
    await this.db.query(
      `UPDATE "User" SET skip_next_match = $1 WHERE email = $2`,
      [skip, email]
    );
    return;
  }

  public async usersToWarn(weekday: WEEKDAY): Promise<UserRecord[]> {
    const nextDayWarnings = await this.db.query(`SELECT *
FROM "User" U WHERE U.coffee_days LIKE '%${weekday}%' AND U.warning_notification = True AND U.skip_next_match = False AND U.is_active = True`);
    return nextDayWarnings.rows;
  }

  public async usersToSkip(weekday: WEEKDAY): Promise<UserRecord[]> {
    const skipping = await this.db.query(
      `SELECT U.id, U.email FROM "User" U WHERE U.coffee_Days LIKE '%${weekday}%' and U.is_active = True and U.skip_next_match = True`
    );
    return skipping.rows;
  }

  public async clearSkipping(weekday: WEEKDAY): Promise<void> {
    await this.db.query(
      `UPDATE "User" U SET skip_next_match = False WHERE U.coffee_days LIKE '%${weekday}%' and U.is_active = True and U.skip_next_match = True`
    );
    return;
  }

  public async findToMatch(weekday: WEEKDAY): Promise<UserRecord[]> {
    const results = await this.db.query(
      `SELECT * FROM "User" WHERE coffee_days LIKE '%${weekday}%' AND skip_next_match = False and is_active = True`,
      []
    );
    return results.rows;
  }

  public async findToMatchWithPrevMatches(
    weekday: WEEKDAY
  ): Promise<UserWithPrevMatchRecord[]> {
    //     const results = await this.db
    //       .query(`with todaysMatches as (SELECT U.id FROM "User" U WHERE U.coffee_days LIKE '%${weekday}%' and U.is_active = True and U.skip_next_match = False),
    //       prevMatches as (SELECT UM.user_id from User_match UM LEFT JOIN Match M On UM.match_id = M.id INNER JOIN USER_MATCH UM2 on UM2.match_id = M.id WHERE UM.user_id in (SELECT * FROM todaysMatches))
    // SELECT * from todaysMatches`);

    const results = await this.db
      .query(`with todayMatches as (SELECT U.id FROM "User" U WHERE U.coffee_days LIKE '%${weekday}%' and U.is_active = True and U.skip_next_match = False),
    prevMatches as (SELECT UM.user_id, count (UM.user_id) as num_matches from User_Match UM
    LEFT JOIN MATCH M
      ON UM.match_id = M.id
    INNER JOIN User_Match UM2
      ON UM2.match_id = M.id
     WHERE UM.user_id in (SELECT id FROM todayMatches) and UM2.user_id in (SELECT id FROM todayMatches) and UM.user_id != UM2.user_id
     group by um.user_id
     order by num_matches desc
     )
    SELECT U2.*, prevMatches.num_matches from "User" U2
      LEFT JOIN prevMatches
      ON prevMatches.user_id = U2.id
      WHERE U2.coffee_days LIKE '%${weekday}%' and U2.is_active = True and U2.skip_next_match = False`);

    return results.rows;
  }
}
