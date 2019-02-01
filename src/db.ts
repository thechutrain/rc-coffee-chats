import { Pool, Client } from 'pg';

// export function connectDb() {
//   console.log('attempting to connect');
//   let pool;
//   try {
//     pool = new Pool({
//       user: 'foo',
//       host: 'localhost',
//       database: 'coffee_chat_dev',
//       password: 'bar',
//       port: 5432
//     });
//   } catch (e) {
//     console.log(e);
//     throw new Error(e);
//   }

//   return pool;
// }

export function createDbClient() {
  const client = new Client({
    user: 'alanchu',
    host: 'localhost',
    database: 'coffee_chat_test',
    port: 5432
  });
  client.connect();

  return client;
}

// export function makeUser(name, age) {}
