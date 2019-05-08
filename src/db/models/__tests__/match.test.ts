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

  it('should not be able to find any match records', async () => {
    const results = await match.find('2019-04-05');
    expect(results.length).toBe(0);
  });

  it('should be able to add a new date (defaults to today)', async () => {
    const { id } = await match.add();
    expect(id).toBe(1);
  });

  it('should be able to add a new date', async () => {
    const { id } = await match.add('2019-04-05');
    expect(id).toBe(1);
  });

  it('should be able to find a match from a particular date', async () => {
    const today = new Date().toISOString().split('T')[0];
    const empty = await match.find(today);

    expect(empty).toEqual([]);

    match.add(today);
    const results = await match.find(today);
    expect(results.length).toBe(1);
    expect(results[0].match_date.toISOString().split('T')[0]).toBe(today);
  });
});
