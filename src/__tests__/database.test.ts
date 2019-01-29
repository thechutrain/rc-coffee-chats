import initDB from '../database';
import * as fs from 'fs';

const TEST_DB_FILE = './.data/test.db';
const exists = fs.existsSync(TEST_DB_FILE);
if (exists) fs.unlinkSync(TEST_DB_FILE)
const db = initDB(TEST_DB_FILE);

test('database can get and insert users', () => {
  db.insertCoffeeDaysForUser('alldays@recurse.com', '0123456');
  db.insertCoffeeDaysForUser('onlyrcdays@recurse.com', '1234');
  let users;
  users = db.getUserConfigs({ emails: ['alldays@recurse.com'] });
  expect(users[0].email).toBe('alldays@recurse.com');
  expect(users[0].coffee_days).toBe('0123456');
  users = db.getUserConfigs({ emails: ['onlyrcdays@recurse.com'] });
  expect(users[0].email).toBe('onlyrcdays@recurse.com');
  expect(users[0].coffee_days).toBe('1234');
});

test('database can get, insert and clear noNextmatches', () => {
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

test('database can get, insert and delete warnings exceptions', () => {
  let warningsExceptions;
  warningsExceptions = db.getEmailExceptions({ tableName: 'warningsExceptions' });
  expect(warningsExceptions.length).toBe(0);
  db.insertIntoWarningExceptions('onlyrcdays@recurse.com');
  db.insertIntoWarningExceptions('alldays@recurse.com');
  warningsExceptions = db.getEmailExceptions({ tableName: 'warningsExceptions' });
  expect(warningsExceptions.length).toBe(2);
  db.deleteFromWarningExceptions('alldays@recurse.com');
  warningsExceptions = db.getEmailExceptions({ tableName: 'warningsExceptions' });
  expect(warningsExceptions.length).toBe(1);
});

test('database can get, and insert matches', () => {
  let matches;
  matches = db.getPastMatches(['onlyrcdays@recurse.com', 'alldays@recurse.com']);
  expect(matches.length).toBe(0);
  db.insertIntoMatches(['onlyrcdays@recurse.com', 'alldays@recurse.com']);
  matches = db.getPastMatches(['onlyrcdays@recurse.com', 'alldays@recurse.com']);
  expect(matches.length).toBe(1);
});
