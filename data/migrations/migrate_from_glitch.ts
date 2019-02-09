import sqlite from 'better-sqlite3';
import * as path from 'path';

import { initDB } from '../../src/db';

const pathGlitchDb = path.join(__dirname, '../', 'glitch_02_09_2019.db');
const pathNewDb = path.join(__dirname, '../', 'migrated.db');

////////////////////////////////////
// Create db connections to old glitch db & new prod db
////////////////////////////////////
const glitchDB = new sqlite(pathGlitchDb, {
  verbose: console.log,
  fileMustExist: true
});
const { user, match } = initDB(pathNewDb, false);
const newDb = new sqlite(pathNewDb);

////////////////////////////////////
// Update the users table
////////////////////////////////////
// 1) get all users from glitch db & add them to new db;
(() => {
  const glitchUsers = glitchDB.prepare(`SELECT * FROM users`).all();
  const insert = newDb.prepare(
    `INSERT INTO User (email, full_name, coffee_days, is_active) VALUES (@email, @email, @coffee_days, @is_active)`
  );

  glitchUsers.forEach(oldUser => {
    insert.run({
      email: oldUser.email,
      full_name: oldUser.full_name,
      coffee_days: `${oldUser.coffee_days}`,
      is_active: '0'
    });

    // Using the proper API I made:
    // user.add({
    //   email: oldUser.email,
    //   full_name: oldUser.email,
    //   coffee_days: `${oldUser.coffee_days}`
    // });
  });
})();

// const warningExceptionUsers = glitchDB
//   .prepare(`SELECT * FROM warningsExceptions`)
//   .all();
// console.log(warningExceptionUsers);
