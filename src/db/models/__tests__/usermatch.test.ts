import { Client } from 'pg';
import { testSetUp } from './dbtesthelper';
import { UserMatch } from '../usermatch';
import { User } from '../user';

describe('Match Model:', () => {
  let db_conn: Client;
  let user: User;
  let usermatch: UserMatch;

  async function seedUserData(userSeedData) {
    for (const userData of userSeedData) {
      await user.add(userData.email, 'full_name_here');
      if (userData.skipNext) {
        user.updateSkip(userData.email, true);
      }
      user.updateDays(userData.email, userData.days);
    }
  }

  beforeAll(async () => {
    db_conn = new Client({
      connectionString:
        process.env.POSTGRES_URL || 'postgres:///coffeechatbot_test',
      statement_timeout: 5000
    });

    await db_conn.connect();
    user = new User(db_conn);
    usermatch = new UserMatch(db_conn);
  });

  beforeEach(async () => {
    await db_conn.query('BEGIN');
    // Makes all the relevant test tables
    await testSetUp(db_conn);
  });

  afterEach(async () => {
    await db_conn.query('ROLLBACK');
  });

  afterAll(async () => {
    await db_conn.end();
  });

  it('should be able to create a new match', async () => {
    const liz = await user.add('liz@recurse.com', 'anon');
    const al = await user.add('al@recurse.com', 'anon');

    await usermatch.addMatch(liz.id, al.id);
  });
});
