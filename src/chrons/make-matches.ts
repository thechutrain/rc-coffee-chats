/**
 * make matches chron job
 *
 */

import shuffle from 'lodash/shuffle';

// ===== REMOVE LATER ========
// LOCAL TESTING PURPOSE ONLY
process.env.PROD_DB = 'prod.db';
process.env.NODE_ENV = 'production';

import * as types from '../types';
import { makeMatches } from '../matching-algo/original-matching-alog/original-match-algo';
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
  ////////////////////
  // Get Users to Match
  ////////////////////
  // const today = new Date().getDay();
  const today = 4;

  // TODO: check if today is an exception or not
  // if today is an exception --> return

  const usersToMatch = db.User.findMatchesByDay(today).map(user => {
    const prevMatches = db.User.findPrevActiveMatches(user.id, today);
    return {
      ...user,
      prevMatches
    };
  });

  ////////////////////
  // Stable Marriage algorithm
  ////////////////////
  // 1) prep: split the users to match into two even groups
  const evenNumMatches = usersToMatch.length % 2 === 0;
  // TEMP: because Im lazy and don't want to import the fallBackMatch type
  let fallBackMatch: null | any = null;
  // TODO: Need to test this!!!! In a day with odd number
  if (!evenNumMatches) {
    // Find the first person who hasn't been matched with the fallback person
    // and pair them together:
    let i;
    for (i = usersToMatch.length - 1; i >= 0; i--) {
      let hasMatchedWithFallback = false;
      for (const prevMatch of usersToMatch[i].prevMatches) {
        if (prevMatch.email === fallBackUser.email) {
          hasMatchedWithFallback = true;
          break;
        }
      }

      if (!hasMatchedWithFallback) {
        fallBackMatch = usersToMatch[i];
        break;
      }
    }

    // Case: everyone has already matched with fallback:
    i = 0;

    // Remove the fallback match, so the pool is an even number of users:
    fallBackMatch = usersToMatch.splice(i, 1);
  }

  const shuffledUsersToMatch = shuffle(usersToMatch);
  const suitorPool = shuffledUsersToMatch.splice(
    0,
    shuffledUsersToMatch.length / 2
  );
  const acceptorPool = shuffledUsersToMatch;

  // ============ DEBUGGING =============
  // console.log(acceptorPool.length);
  // console.log(suitorPool.length);
  // console.log(usersToMatch);
  // console.log(usersToMatch.length);
  // console.log(suitorPool);

  ////////////////////
  // Message each user their match
  ////////////////////

  ////////////////////
  // clear skip next match of users who were matched today
  ////////////////////

  ////////////////////
  // Log output & send to admin
  ////////////////////
})();
