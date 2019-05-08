import { Client } from 'pg';
import { Match } from './match';

export class UserMatch {
  db: Client;
  match: Match;
  constructor(db: Client) {
    this.db = db;
    this.match = new Match(this.db);
  }

  public async initTable(): Promise<void> {
    await this.db.query(`CREATE TABLE USER_MATCH (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL
    )`);

    return;
  }

  public async addMatch(user_1_id: number, user_2_id: number): Promise<void> {
    const { id: match_id } = await this.match.add();

    await this.db.query(
      `INSERT INTO USER_MATCH (user_id, match_id) VALUES ($1, $3), ($2, $3)`,
      [user_1_id, user_2_id, match_id]
    );

    return;
  }
}
