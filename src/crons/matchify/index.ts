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

// TESTING: so we can run this from package.json as a script
if (process.env.NODE_ENV === 'development') {
  console.log('... running matchify() in DEV mode');
  matchify();
}

export async function matchify() {
  const db = initDB();

  const { todaysMatches, fallBackMatch } = makeMatches(db);
  const repeatedMatches = todaysMatches.filter(isRepeatMatch);

  // Record Matches:
  if (process.env.NODE_ENV === 'production') {
    console.log('In production, recording matches!');
    todaysMatches.forEach(match => {
      const userIds = [match[0].id, match[1].id];
      db.UserMatch.add(userIds);
    });
  }

  // Clear skip status of users who wanted to skip today:
  const skippingUsers = clearSkippers(db); // Only

  // Notify each match pair who they've been matched with:
  todaysMatches.forEach(notifyMatchPair);

  ////////////////////
  // Logging
  ////////////////////

  const logs = {
    numMatches: todaysMatches.length,
    numRepeats: repeatedMatches.length,
    numSkips: skippingUsers.length,
    todaysMatchesEmails: todaysMatches.map(pair => [
      pair[0].email,
      pair[1].email
    ]),
    repeatedMatches,
    fallBackMatch,
    runTime: startTime
  };

  const full_logs = {
    ...logs,
    skippingUsers,
    todaysMatches
  };

  console.log(`\n>> Todays Matches: ${todaysMatches.length}`, {
    todaysMatches
  });
  console.log(`\n>> Repeated Matches: ${repeatedMatches.length}`, {
    repeatedMatches
  });

  repeatedMatches.forEach(matchPair => {
    console.log('>> REPEAT MATCH DETAILS:');
    console.log(matchPair[0].full_name, matchPair[0].prevMatches);
    console.log(matchPair[1].full_name, matchPair[1].prevMatches);
  });

  console.log('\n>> Fallback', { fallBackMatch });

  // Send messages to Admin
  console.log(full_logs);
  notifyAdmin(JSON.stringify(logs));
}

// TESTING purposes
if (process.env.NODE_ENV === 'development') {
  console.log(`DEV: ${startTime}`);
  matchify();
}
