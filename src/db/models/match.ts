import { Client } from 'pg';

export class Match {
  db: Client;
  constructor(db: Client) {
    this.db = db;
  }

  public async initTable() {
    this.db.query(`CREATE TABLE IF NOT EXISTS Match (
      id SERIAL PRIMARY KEY,
      match_date date NOT NULL DEFAULT CURRENT_DATE,
      rain_checked BOOLEAN DEFAULT False
    )`);
  }

  public async add(date?: string): Promise<number> {
    if (date) {
      const { oid } = await this.db.query(
        `INSERT INTO Match (match_date) VALUES ($1)`,
        [date]
      );
      return oid;
    } else {
      const { oid } = await this.db.query(`INSERT INTO MATCH`);
      return oid;
    }
  }
}
