import { Client } from 'pg';
import { Match } from '../match';

describe('Match Model:', () => {
  let db_conn: Client;
  let match: Match;

  beforeAll(async () => {
    db_conn = new Client({
      connectionString:
        process.env.POSTGRES_URL || 'postgres:///coffeechatbot_test',
      statement_timeout: 5000
    });

    await db_conn.connect();
    match = new Match(db_conn);
  });

  beforeEach(async () => {
    await db_conn.query('BEGIN');
    await match.initTable();
  });

  afterEach(async () => {
    await db_conn.query('ROLLBACK');
  });
});
