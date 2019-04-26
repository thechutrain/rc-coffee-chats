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
import { cloneDeep } from 'lodash';
import moment from 'moment';
import 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from '../../db';
import * as types from '../../types';
import { createSuitorAcceptorPool } from './create-suitor-acceptor-pool';
import { makeStableMarriageMatches } from '../../matching-algo/stable-marriage-matching/stable-marriage-algo';
import { Acceptor } from '../../matching-algo/stable-marriage-matching/marriage-types';
import { UserWithPrevMatchRecord } from '../../db/models/user_model';
import { templateMessageSender } from '../../zulip-messenger/msg-sender';

const TODAYS_MATCHES: Array<
  [UserWithPrevMatchRecord, UserWithPrevMatchRecord]
> = [];
const REPEAT_MATCHES: Array<[string, string]> = [];

export function makeMatches(sendMessages = false) {
  const db = initDB();

  // TODO: Check if today is an exception or not!

  // Get Users to Match for Today:
  const usersToMatch = db.User.findUsersPrevMatchesToday();

  // Clear all the skip next match warnings for todays people
  db.User.clearTodaysSkippers();

  ////////////////////////////////////////
  // Stable Marriage Algorithm
  ////////////////////////////////////////
  // PREP: create a pool of suitors, acceptors
  // NOTE: fallbackUser is used to ensure we have an even subset of suitors/acceptors

  // TODO: get the fallbackuser from the user table!!! 💣
  const fallBackUser = {
    id: 117,
    email: 'alicia@recurse.com',
    full_name: 'Alicia',
    coffee_days: 'not right',
    warning_exception: 0,
    skip_next_match: 0,
    is_active: 1,
    is_faculty: 1,
    num_matches: 0,
    prevMatches: []
  };

  const { suitors, acceptors, fallBackMatch } = (() => {
    return createSuitorAcceptorPool(usersToMatch, fallBackUser);
  })();

  if (fallBackMatch !== null) {
    TODAYS_MATCHES.push([fallBackUser, fallBackMatch]);
  }

  const acceptorSuitorMatches = makeStableMarriageMatches(
    cloneDeep(suitors),
    cloneDeep(acceptors)
  );

  acceptorSuitorMatches.forEach(acceptorSuitorMatch => {
    const acceptor = acceptorSuitorMatch[0];
    const suitor = acceptorSuitorMatch[1];
    TODAYS_MATCHES.push([acceptor.data, suitor.data]);
  });

  ////////////////////////////////////
  // Send Notifications of matches etc
  ///////////////////////////////////
  TODAYS_MATCHES.forEach(match => {
    const acceptorMatch = match[0];
    const suitorMatch = match[1];
    // Record matches in the user_match, match tables!
    const user_ids = [acceptorMatch.id, suitorMatch.id];
    db.UserMatch.addNewMatch(user_ids);

    // Check if they are unique matches
    acceptorMatch.prevMatches.forEach(prevMatch => {
      if (prevMatch.id === suitorMatch.id) {
        REPEAT_MATCHES.push([acceptorMatch.email, suitorMatch.email]);
      }
    });

    // Send out match emails!
    if (sendMessages) {
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
  // ====== debugging =====
  const localTime = moment()
    .tz('America/New_York')
    .format('LLLL');

  console.log(`====== makeMatches() ======\n${localTime}`);
  console.log(`>> Users who want to be matched`);
  console.log(
    usersToMatch.map(user => {
      return {
        email: user.email
        // prevMatches: user.prevMatches
      };
    })
  );
  console.log('\n>> Matches:');
  TODAYS_MATCHES.forEach(matchPair => {
    console.log(
      `${matchPair[0].full_name} | ${matchPair[0].email} <--> ${
        matchPair[1].full_name
      } | ${matchPair[1].email}`
    );
  });
  console.log(`>> fall back:`);
  console.log(fallBackMatch);

  console.log(`total number of match pairs: ${TODAYS_MATCHES.length}`);
  console.log(`Number of repeated matches: ${REPEAT_MATCHES.length}`);
}

// IMPORTANT!!! 💣
// only pass in true to make Matches if you want to
// annoy and send a bunch of people matches since Im using the prod db!
makeMatches();
