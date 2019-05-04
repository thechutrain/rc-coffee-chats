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
import moment from 'moment';
import 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from '../../db';
import * as types from '../../types';
import { makeTodaysMatches } from './make-todays-matches';
// import { getNewCurrentBatches } from '../../recurse-api';
import { handlePossibleOffboarding } from '../../one-off-services/offboarding/index';
// Messaging-related, TODO: import from a single file
import { templateMessageSender } from '../../zulip-messenger/msg-sender';
import { notifyAdmin } from '../../zulip-messenger/notify-admin';

const startTime = moment()
  .tz('America/New_York')
  .format('L h:mm:ss');
const logArray = [`====== makeMatches() @ ${startTime} =====`];
const REPEAT_MATCHES: Array<[string, string]> = [];

matchify();
async function matchify() {
  const db = initDB();
  const isProd = process.env.NODE_ENV === 'production';

  const { TODAYS_MATCHES, fallBackMatch } = makeTodaysMatches(db);

  // TODO: organize code more
  // const { REPEAT_MATCHES } = findRepeatMatches(TODAYS_MATCHES);

  ////////////////////////////////////
  // Send Notifications of matches etc
  ///////////////////////////////////
  TODAYS_MATCHES.forEach(match => {
    const acceptorMatch = match[0];
    const suitorMatch = match[1];
    // Record matches in the user_match, match tables!
    if (isProd) {
      const user_ids = [acceptorMatch.id, suitorMatch.id];
      db.UserMatch.addNewMatch(user_ids);
    }

    // Check if they are unique matches
    acceptorMatch.prevMatches.forEach(prevMatch => {
      if (prevMatch.id === suitorMatch.id) {
        REPEAT_MATCHES.push([acceptorMatch.email, suitorMatch.email]);
      }
    });

    // Send out match emails!
    if (isProd) {
      templateMessageSender(
        acceptorMatch.email,
        types.msgTemplate.TODAYS_MATCH,
        {
          full_name: suitorMatch.full_name,
          first_name: suitorMatch.full_name.split(' ')[0]
        }
      );

      templateMessageSender(suitorMatch.email, types.msgTemplate.TODAYS_MATCH, {
        full_name: acceptorMatch.full_name,
        first_name: acceptorMatch.full_name.split(' ')[0]
      });
    }
  });

  ////////////////////
  // Logging
  ////////////////////
  logArray.push('>> TODAYS MATCHES:');
  TODAYS_MATCHES.forEach((matchPair, index) => {
    logArray.push(
      `>> MATCH #${index + 1}: ${matchPair[0].full_name} <--> ${
        matchPair[1].full_name
      }`
    );
  });

  // TEMP: keep printing this out?
  console.log('\n === Matches as email[] ===');
  const emailTodaysMatches = TODAYS_MATCHES.map(matchPair => {
    return [matchPair[0].email, matchPair[1].email];
  });
  console.log(emailTodaysMatches);

  if (fallBackMatch) {
    logArray.push(`todays fallback match: ${fallBackMatch.full_name}`);
  } else {
    logArray.push(`Not fallback match today`);
  }

  if (REPEAT_MATCHES.length) {
    REPEAT_MATCHES.forEach(matchpair => {
      logArray.push(`Repeat Match: ${JSON.stringify(matchpair)}`);
    });
  }

  logArray.push(`total number of match pairs: ${TODAYS_MATCHES.length}`);
  logArray.push(`Number of repeated matches: ${REPEAT_MATCHES.length}`);
  logArray.push(
    `=========== END of Matchify cron @ ${moment()
      .tz('America/New_York')
      .format('L h:mm:ss')} ==============`
  );

  // Send messages to Admin
  notifyAdmin(logArray.join(`\n`));
}
