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
import { getStartingEndingBatches } from '../../recurse-api';
// Messaging-related, TODO: import from a single file
import { templateMessageSender } from '../../zulip-messenger/msg-sender';
import { notifyAdmin } from '../../zulip-messenger/notify-admin';
const startTime = moment()
  .tz('America/New_York')
  .format('L h:mm:ss');
const logArray = [`====== makeMatches() @ ${startTime} =====`];
const REPEAT_MATCHES: Array<[string, string]> = [];

matchify(false);
async function matchify(runForReal = true) {
  const db = initDB();

  /** TODO: Exception & Special Day handling
   * Special day cases:
   * a) First Day of Batch  --> do not match && notify users who planned on matching today?
   * b) Last Day of Batch   --> deactivate all users automatically & notify them offboarding.
   * c) Holidays --> warn the day before? Do Later ...
   */
  const { starting_batches, ending_batches } = await getStartingEndingBatches();
  if (!starting_batches.length) {
    // It's the first day! default do not run chat bot!
    console.log('Its the first day of the batch!!!');
    /** TODO: tasks for the first day
     * - notify all users who were suppose to be matched today that they won't have a match
     * - warn the maintainers that today is the first day so matches are skipped... spread the word!
     */
  } else if (!ending_batches.length) {
    // Its the last day! Off-board active users.
    /** TODO: tasks for end of batch
     * - find all users of chat bot who are also in this last batch
     * - notify them that they have been deactivated, but if they want to stay in touch. welcome to!
     * - warn matinainer that today is the last day of the batch? And everything is Okay.
     *
     */
    console.log('Its the end of the batch!!');
  }

  const { TODAYS_MATCHES, fallBackMatch } = makeTodaysMatches(db, runForReal);

  // TODO: organize code more
  // const { REPEAT_MATCHES } = findRepeatMatches(TODAYS_MATCHES);

  ////////////////////////////////////
  // Send Notifications of matches etc
  ///////////////////////////////////
  TODAYS_MATCHES.forEach(match => {
    const acceptorMatch = match[0];
    const suitorMatch = match[1];
    // Record matches in the user_match, match tables!
    if (runForReal) {
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
    if (runForReal) {
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
