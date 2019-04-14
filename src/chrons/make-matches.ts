/**
 * make matches chron job
 *
 */
// LOCAL TESTING PURPOSE ONLY
process.env.PROD_DB = 'prod.db';
process.env.NODE_ENV = 'production';

import * as types from '../types';
import { makeMatches } from '../matching-algo/match-algo';
import { initDB } from '../db';

const db = initDB();

/**
 *  PseudoCode:
 *  -- determine today's date
 *  -- check if today is an exception or not (LATER)
 *  -- get all the users who want to be matched today:
 *    -- also find their previous matches:
 *  -- make matches
 *  -- reset all the users who wanted to skip their match today!
 *  -- send zulip message to all match pairs
 *  -- send message to admin folks the results of the match pairs!
 */

// const today = types.WEEKDAY[new Date().getDay()];
const fallBackUser = {
  email: 'alicia@recurse.com',
  full_name: 'Alicia',
  prevMatches: []
};

const adminMessage = (() => {
  // const today = new Date().getDay();
  const today = 4;
  // if today is an exception --> return

  const usersToMatch = db.User.findMatchesByDay(today).map(user => {
    const prevMatches = db.User.findPrevActiveMatches(user.id, today);
    return {
      ...user,
      prevMatches
    };
  });

  console.log(usersToMatch);
  console.log(usersToMatch.length);

  // const matches = makeMatches(usersToMatch, fallBackUser);
  // console.log(matches);
})();
