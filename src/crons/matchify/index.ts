/**
 *  PseudoCode:
 *  -- determine today's date
 *  -- check if today is an exception or not (LATER)
 *  -- get all the users who want to be matched today:
 *    -- also find their previous matches:
 *  -- make matches
 *  -- reset all the users who wanted to skip their match today!
 *  -- send zulip message to all match pairs
 *  -- record matches in the DB!!
 *  -- send message to admin folks the results of the match pairs!
 */
import moment from 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from '../../db';
import { makeMatches } from './make-todays-matches';
import { clearSkippers } from './clear-skipping-users';
import { isRepeatMatch } from './is-repeat-match';
import { notifyMatchPair } from './notify-match-pair';
import { notifyAdmin } from '../../zulip-messenger/';

const startTime = moment()
  .tz('America/New_York')
  .format('L h:mm:ss');

export async function matchify() {
  const db = initDB();

  const { todaysMatches, fallBackMatch } = makeMatches(db);
  const repeatedMatches = todaysMatches.filter(isRepeatMatch);

  // Record Matches:
  todaysMatches.forEach(match => {
    const userIds = [match[0].id, match[1].id];
    db.UserMatch.add(userIds);
  });

  // Clear skip status of users who wanted to skip today:
  const skippingUsers = clearSkippers(db); // Only

  // Notify each match pair who they've been matched with:
  todaysMatches.forEach(notifyMatchPair);

  ////////////////////
  // Logging
  ////////////////////

  const logs = {
    todaysMatches,
    numMatches: todaysMatches.length,
    repeatedMatches,
    numRepeats: repeatedMatches.length,
    fallBackMatch,
    skippingUsers,
    numSkips: skippingUsers.length,
    runTime: startTime
  };

  console.log(`\n>> Todays Matches: ${todaysMatches.length}`, {
    todaysMatches
  });
  console.log(`\n>> Repeated Mathces: ${repeatedMatches.length}`, {
    repeatedMatches
  });
  console.log('\n>> Fallback', { fallBackMatch });

  // Send messages to Admin
  console.log(JSON.stringify(logs));
  notifyAdmin(JSON.stringify(logs));
}

// TESTING purposes
if (process.env.NODE_ENV === 'development') {
  console.log(`DEV: ${startTime}`);
  matchify();
}
