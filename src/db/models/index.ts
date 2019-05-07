import { User } from './user';
import { Client } from 'pg';

export async function initDB() {
  const client = new Client({
    connectionString:
      process.env.POSTGRES_URL || 'postgres://localhost:5432/coffeechatbot',
    statement_timeout: 5000
  });

  await client.connect();

  const userModel = new User(client);
  // await userModel.initTable();

  return {
    user: userModel
  };
}

// testing
initDB().catch(e => {
  console.log(e);
});
