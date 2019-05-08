import { Client } from 'pg';
import { testSetUp } from './dbtesthelper';
import { UserMatch } from '../usermatch';

describe('Match Model:', () => {
  let db_conn: Client;

  beforeAll(async () => {
    db_conn = new Client({
      connectionString:
        process.env.POSTGRES_URL || 'postgres:///coffeechatbot_test',
      statement_timeout: 5000
    });

    await db_conn.connect();
  });

  beforeEach(async () => {
    await db_conn.query('BEGIN');
    // await usermatch.initTable();
    await testSetUp(db_conn);
  });

  afterEach(async () => {
    await db_conn.query('ROLLBACK');
  });

  afterAll(async () => {
    await db_conn.end();
  });

  it('should fail', () => {
    expect(false).toBe(true);
  });
});
