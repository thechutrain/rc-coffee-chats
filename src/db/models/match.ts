import { Client } from 'pg';
import { MatchRecord } from '../schema';

export class Match {
  db: Client;
  constructor(db: Client) {
    this.db = db;
  }

  public async initTable() {
    this.db.query(`CREATE TABLE IF NOT EXISTS Match (
      id SERIAL PRIMARY KEY,
      match_date DATE NOT NULL DEFAULT CURRENT_DATE,
      rain_checked BOOLEAN DEFAULT False
    )`);
  }

  public async add(date?: string): Promise<MatchRecord> {
    if (date) {
      const { rows } = await this.db.query(
        `INSERT INTO Match (match_date) VALUES ($1) RETURNING *`,
        [date]
      );
      return rows[0];
    } else {
      const { rows } = await this.db.query(
        `INSERT INTO MATCH (match_date) VALUES (DEFAULT) RETURNING *`
      );
      return rows[0];
    }
  }

  public async find(date: string): Promise<MatchRecord[]> {
    const { rows } = await this.db.query(
      // `SELECT * from Match WHERE match_date LIKE '%${date}'`
      `SELECT * from Match`
    );
    return rows;
  }
}
