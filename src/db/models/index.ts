import { User } from './user';
import { Client } from 'pg';
import { UserMatch } from './usermatch';
import { Match } from './match';

export async function initDB() {
  const str =
    process.env.POSTGRES_URL || 'postgres://localhost:5432/coffeechatbot';
  console.log(str);
  const client = new Client({
    connectionString: str,
    statement_timeout: 5000
  });

  await client.connect();

  const user = new User(client);
  const usermatch = new UserMatch(client);
  const match = new Match(client);

  await user.initTable();
  await usermatch.initTable();
  await match.initTable();

  return {
    user,
    usermatch,
    match
  };
}
