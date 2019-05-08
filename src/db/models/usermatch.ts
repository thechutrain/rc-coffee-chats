import { Client } from 'pg';
import { Match } from './match';
import { User } from './user';

export class UserMatch {
  db: Client;
  constructor(db: Client) {
    this.db = db;
  }

  public async initTable(): Promise<void> {
    await this.db.query(`CREATE TABLE USER_MATCH (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL
    )`);
    return;
  }

  public async addMatch(userA_id, userB_id) {
    // Create a new Match record
    // Create usermatch record for userA
    // Create usermatch record for userB
  }
}
