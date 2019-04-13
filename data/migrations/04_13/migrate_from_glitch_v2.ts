import sqlite from 'better-sqlite3';
import * as path from 'path';
import { initDB } from '../../../src/db';

import activeUsers from './activeUsers04_13';

const pathGlitchDb = path.join(__dirname, 'glitch.db');
const glitchDB: sqlite = new sqlite(pathGlitchDb, { fileMustExist: true });
const pathToMigrated = path.join(__dirname, 'migrated_4_14_19.db');
const migratedDB = initDB(pathToMigrated, false);

////////////////////////////////////
// Update the users table
///////////////////////////////////
// 1) Get all users from glitch database and add them to migrated DB
const glitchUsers = glitchDB.prepare('Select * from Users').all(); // 71 users
glitchUsers.forEach(user => {
  // console.log(user.email);
  // console.log(user.coffee_days);
  migratedDB.User.add({
    email: user.email,
    full_name: user.email,
    coffee_days: user.coffee_days,
    is_active: '0'
  });
});

// 2) find all users in the activeUser list and see if they are in the users database
// update their active status to be 1

// migratedDB.User.add({});
