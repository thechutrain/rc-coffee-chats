import { Client } from 'pg';
import { UserRecord } from '../../olddb/dbTypes';
import { WeekSpec } from 'moment';
import { WEEKDAYS } from '../../constants';
import { WEEKDAY } from '../../types';

export class User {
  db: Client;
  constructor(db: Client) {
    this.db = db;
  }

  public async initTable(): Promise<void> {
    await this.db.query(`CREATE TABLE IF NOT EXISTS "User" (
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
    const results = await this.db.query(`SELECT * FROM "User" WHERE EMAIL = $1`, [email]);
    return results.rowCount === 1;
  }

  public async findByEmail(email: string): Promise<UserRecord> {
    const results = await this.db.query(`SELECT * FROM "User" WHERE EMAIL = $1`, [email]);
    if (results.rowCount !== 1) {
      throw new Error(`Could not find a user with the email: ${email}`);
    }
    return results.rows[0]
  }

  public async add(email: string, full_name: string) {
    return await this.db.query(`INSERT INTO "User" (email, full_name) VALUES ($1, $2)`, [email, full_name]);
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

    await this.db.query(`UPDATE "User" SET coffee_days = $1 WHERE email = $2`, [weekdayStr, email]);
    return
  }

  public async updateWarnings(email: string, shouldSkip: boolean): Promise<void> {
    await this.db.query(`UPDATE "User" SET warning_notification = $1 WHERE email = $2`, [shouldSkip, email]);
    return
  }

  public async updateActive(email: string, isActive: boolean): Promise<void> {
    await this.db.query(`UPDATE "User" SET is_active = $1 WHERE email = $2`, [isActive, email]);
    return
  }

  public async updateSkip(email: string, skip: boolean): Promise<void> {
    await this.db.query(`UPDATE "User" SET skip_next_match = $1 WHERE email = $2`, [skip, email]);
    return
  }

  public async usersToWarn(weekday: WEEKDAY): Promise<UserRecord[]> {
    const nextDayWarnings = await this.db.query(`SELECT *
FROM "User" U WHERE U.coffee_days LIKE '%${weekday}%' AND U.warning_notification = True AND U.skip_next_match = False AND U.is_active = True`);
    return nextDayWarnings.rows;
  }

  public async usersToSkip(weekday: WEEKDAY): Promise<UserRecord[]> {
    const skipping = await this.db.query(`SELECT U.id, U.email FROM "User" U WHERE U.coffee_Days LIKE '%${weekday}%' and U.is_active = True and U.skip_next_match = True`);
    return skipping.rows;
  }
}
