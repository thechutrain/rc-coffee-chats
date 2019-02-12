/**
 * This file is the glue for getting data from the DB
 * and using the matching algo to pair up users
 */
import * as path from 'path';

import { initDB } from '../db';

// open a connection to the database
const DB_FILENAME = 'migrated.db';
const pathToDb = path.join(__dirname, '../../', 'data', DB_FILENAME);
const db = initDB(pathToDb, true);

// find the users to match today
// TODO: need to fix this master query later
// const usersToMatchToday = db.user.getTodaysUsersWithPrevMatches();

const usersToMatchToday = db.user.getTodaysMatches(new Date().getDay());
const NUM_USERS_TO_MATCH = usersToMatchToday.length;

console.log(NUM_USERS_TO_MATCH);

console.log(JSON.stringify(usersToMatchToday[NUM_USERS_TO_MATCH - 1]));
// console.log(JSON.stringify(usersToMatchToday));
// console.log(usersToMatchToday);
// db.user.getPrevMatches();

// pass into makeMatches algo

// print out matches
