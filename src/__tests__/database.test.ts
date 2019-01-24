import initDB from '../database';
const db = initDB();

test('database can do data', async () => {
  expect.assertions(5);
  db.insertCoffeeDaysForUser('alldays@recurse.com', '0123456');
  db.insertCoffeeDaysForUser('onlyrcdays@recurse.com', '1234');
  let users;
  users = await db.getUserConfigs({ emails: ['alldays@recurse.com'] });
  expect(users[0].email).toBe('alldays@recurse.com');
  expect(users[0].coffee_days).toBe('0123456');
  users = await db.getUserConfigs({ emails: ['onlyrcdays@recurse.com'] });
  expect(users[0].email).toBe('onlyrcdays@recurse.com');
  expect(users[0].coffee_days).toBe('1234');
  console.log(users);
  const data = await db.getEmailExceptions({ tableName: 'noNextMatch' });
  expect(data.length).toBeFalsy();
});
