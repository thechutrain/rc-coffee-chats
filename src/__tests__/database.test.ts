import initDB from '../database';
const db = initDB();

test('database can insert users', () => {
  db.insertCoffeeDaysForUser('alldays@recurse.com', '0123456');
  db.insertCoffeeDaysForUser('onlyrcdays@recurse.com', '1234');
  let users;
  users = db.getUserConfigs({ emails: ['alldays@recurse.com'] });
  expect(users[0].email).toBe('alldays@recurse.com');
  expect(users[0].coffee_days).toBe('0123456');
  users = db.getUserConfigs({ emails: ['onlyrcdays@recurse.com'] });
  expect(users[0].email).toBe('onlyrcdays@recurse.com');
  expect(users[0].coffee_days).toBe('1234');
})

test('database can insert and clear noNextmatches', () => {
  let noNextMatches;
  noNextMatches = db.getEmailExceptions({ tableName: 'noNextMatch' });
  expect(noNextMatches.length).toBe(0);
  db.insertIntoNoNextMatch('onlyrcdays@recurse.com');
  db.insertIntoNoNextMatch('alldays@recurse.com');
  noNextMatches = db.getEmailExceptions({ tableName: 'noNextMatch' });
  expect(noNextMatches.length).toBe(2);
  db.clearNoNextMatchTable();
  noNextMatches = db.getEmailExceptions({ tableName: 'noNextMatch' });
  expect(noNextMatches.length).toBe(0);
});
