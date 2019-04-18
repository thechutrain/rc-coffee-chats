import sqlite from 'better-sqlite3';
import * as path from 'path';
import { initDB } from '../../../src/db';

import activeUsers from './activeUsers04_13';
import inactiveUsers from './inactiveUsers04_13';
const pathGlitchDb = path.join(__dirname, 'glitch.db');
const glitchDB: sqlite = new sqlite(pathGlitchDb, { fileMustExist: true });
const pathToMigrated = path.join(__dirname, 'migrated_prod.db');
const migratedDB = initDB(pathToMigrated, false);

////////////////////////////////////
// Update the users table
///////////////////////////////////
// 1) Get all users from glitch database and add them to migrated DB

const glitchUsers = glitchDB
  .prepare('Select * from Users')
  .all()
  .concat(inactiveUsers); // 71 users

// console.log(glitchUsers.length);
// const uniqueUsers = new Set(glitchUsers);
// console.log(uniqueUsers.size);

glitchUsers.forEach(user => {
  const full_name = user.email ? user.email : user;
  const coffee_days =
    user.coffee_days !== undefined ? user.coffee_days : '1234';
  migratedDB.User.add({
    email: full_name,
    full_name,
    coffee_days: `${coffee_days}`,
    is_active: '0'
  });
});

// 2) find all users in the activeUser list and see if they are in the users database
// update their active status to be 1
let foundActiveUsers = 0;
const usersNotFound: any[] = [];
activeUsers.forEach(email => {
  try {
    migratedDB.User.findByEmail(email);
    migratedDB.User.update({ is_active: '1' }, { email });
    foundActiveUsers += 1;
  } catch (e) {
    usersNotFound.push(email);
  }
});
// console.log(activeUsers); // 26
// console.log(usersNotFound.length); // 23

// For users active on the stream but not in the database
usersNotFound.forEach(email => {
  const { changes } = migratedDB.User.add({
    email,
    full_name: email,
    coffee_days: '1234',
    is_active: '1'
  });
  if (changes !== 1) {
    console.log(`Could not add in user: ${email}`);
  }
});

const total_users = migratedDB.User.count();
console.log(`Total number of users: ${total_users}`);

////////////////////////////////////
// Update all the previous matches
///////////////////////////////////
const all_matches = glitchDB.prepare('SELECT * from Matches').all();
// console.log(all_matches.length); // 1765

// console.log(all_matches[0]); // date, email1, email2;
let skip_matches = 0;
let matches = 0;
all_matches.forEach(match_record => {
  const { date, email1, email2 } = match_record;
  let user_1;
  let user_2;
  let skip = false;
  try {
    user_1 = migratedDB.User.findByEmail(email1);
    user_2 = migratedDB.User.findByEmail(email2);
  } catch (e) {
    skip_matches += 1;
    skip = true;
  }
  if (!skip) {
    try {
      migratedDB.UserMatch.addNewMatch([user_1.id, user_2.id], date);
      matches += 1;
    } catch (e) {
      console.log('========== ERROR ===========');
      console.log(e);
      console.log(user_1.email);
      console.log(user_2.email);
    }
  }
});

console.log('=========');
console.log(skip_matches); // 0
console.log(matches); // 1830
