import { Client } from 'pg';
import { User } from './user';
import { WEEKDAYS } from '../../constants';

describe('User Model:', () => {
  let db_conn: Client;
  let user: User

  beforeAll(async () => {
    const str = process.env.POSTGRES_URL || 'postgres:///coffeechatbot_test';
    db_conn = new Client({
      connectionString: str,
      statement_timeout: 5000
    });

    await db_conn.connect();
    user = new User(db_conn);



  })

  beforeEach(async () => {
    await db_conn.query("BEGIN"); // Never commit test data
    await user.initTable();
  })

  afterEach(async () => {
    await db_conn.query("ROLLBACK"); // Never commit test data
  })

  afterAll(async () => {
    await db_conn.end()
  })

  it("should not find unknown user", async () => {
    await expect(user.findByEmail('nobody@recurse.com'))
    .rejects.toThrowError('Could not find a user with the email: nobody@recurse.com');
  });

  it("should say unknown email exists", async () => {
    expect(await user.emailExists("nobody@recurse.com"))
      .toBe(false);
  })

  it("should add new user", async() => {
    await user.add("somebody@recurse.com", "Some BODY");
    expect(await user.emailExists("somebody@recurse.com"))
      .toBe(true);
  })

  it("should update days", async() => {
    let email = "somebody@recurse.com";
    await user.add(email, "Some BODY");
    await user.updateDays(email, [WEEKDAYS.MON, WEEKDAYS.FRI]);

    let somebody = await user.findByEmail(email);
    expect(somebody.coffee_days).toEqual("15");
  })

  it("should update skip next", async() => {
    let email = "somebody@recurse.com";
    await user.add(email, "Some BODY");
    let somebody = await user.findByEmail(email);
    expect(somebody.warning_notification).toBe(true);

    await user.updateSkip(email, false);

    somebody = await user.findByEmail(email);
    expect(somebody.warning_notification).toBe(false);
  })
})
