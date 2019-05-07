import { Client } from 'pg';

export class User {
  db: Client;
  constructor(db) {
    this.db = db;
  }

  public async initTable(): Promise<void> {
    await this.db.query(`CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      coffee_days TEXT DEFAULT 1234,
      skip_next_match BOOLEAN DEFAULT 0,
      warning_exception BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      is_faculty BOOLEAN DEFAULT 0,
      is_admin BOOLEAN DEFAULT 0
    )`);
  }
}
