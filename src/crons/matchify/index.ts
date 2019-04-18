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
import { cloneDeep } from 'lodash';
import moment from 'moment';
import 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { UserWithPrevMatchRecord } from '../../db/models/user_model';
import { initDB } from '../../db';
import { createSuitorAcceptorPool } from './create-suitor-acceptor-pool';
import { makeStableMarriageMatches } from '../../matching-algo/stable-marriage-matching/stable-marriage-algo';
import { Acceptor } from '../../matching-algo/stable-marriage-matching/marriage-types';
import { sendGenericMessage } from '../../zulip-messenger/msg-sender';

type logDataType = {
  numMatches?: number;
  fallBackMatch?: any;
  emailsMatches?: Array<[string, string]>;
  suitors?: any;
  acceptors?: any;
};

export function makeMatches(sendMessages = false) {
  const db = initDB();
  // const today = moment()
  //   .tz('America/New_York')
  //   .day();

  ////////////////////
  // Get Users to Match
  ////////////////////
  const usersToMatch: UserWithPrevMatchRecord[] = (() => {
    return db.User.findUsersPrevMatchesToday();
    // return db.User.findActiveUsers().map(user => {
    //   return {
    //     ...user,
    //     num_matches: 0,
    //     prevMatches: []
    //   };
    // });
  })();

  // Clear all the skip next match warnings for todays people
  db.User.clearTodaysSkippers();

  // ==== debugging =====
  // console.log(usersToMatch);
  // console.log(`Total number of matches: ${total_num_matches}`);

  ////////////////////
  // Create Stable Marriage Pool
  ////////////////////
  // TODO: get the fallbackuser from the user table!!!
  // 💣
  const fallBackUser = {
    id: -1,
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

  // ====== debugging =====
  // console.log(`Fall back match: ${JSON.stringify(fallBackMatch)}`);
  // console.log(`Size of suitors: ${suitors.size}`);
  // console.log(`Size of acceptors: ${acceptors.size}`);

  const { emailMatches, acceptorSuitorMatches } = ((
    suitorPool,
    acceptorPool
  ) => {
    const _acceptorSuitorMatches = makeStableMarriageMatches(
      suitorPool,
      acceptorPool
    );

    const _emailMatches = _acceptorSuitorMatches.map(match => {
      return [
        (match[0].data as UserWithPrevMatchRecord).email,
        (match[1].data as UserWithPrevMatchRecord).email
      ];
    });

    return {
      emailMatches: _emailMatches,
      acceptorSuitorMatches: _acceptorSuitorMatches
    };
  })(cloneDeep(suitors), cloneDeep(acceptors));

  // Add the fallBackMatch to the list of users to match:
  if (fallBackMatch !== null) {
    emailMatches.push([fallBackUser.email, fallBackMatch.email]);
  }

  ////////////////////
  // Test for the number of previous matches?
  ////////////////////
  let num_repeated_matches = 0;
  emailMatches.forEach(matchPair => {
    const acceptorEmail = matchPair[0];
    const suitorEmail = matchPair[1];
    const acceptorUserPrevMatches = (acceptors.get(acceptorEmail) as Acceptor<
      UserWithPrevMatchRecord
    >).data.prevMatches;

    acceptorUserPrevMatches.forEach(prev_match => {
      if (prev_match.email === suitorEmail) {
        num_repeated_matches += 1;
      }
    });
  });

  ////////////////////
  // Message each user their match
  ////////////////////

  if (sendMessages) {
    acceptorSuitorMatches.forEach(match => {
      const acceptorData = match[0].data as UserWithPrevMatchRecord;
      const suitorData = match[1].data as UserWithPrevMatchRecord;
      const acceptorMessage = `Hi there! 👋
      You've been matched today with @**${suitorData.full_name}**`;
      const suitorMessage = `Hi there! 👋
      You've been matched today with @**${acceptorData.full_name}**`;

      sendGenericMessage(acceptorData.email, acceptorMessage);
      sendGenericMessage(suitorData.email, suitorMessage);
    });
  }

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
  console.log(emailMatches);
  console.log(`total number of match pairs: ${emailMatches.length}`);
  console.log(`>> fall back:`);
  console.log(fallBackMatch);
  console.log(`\nNumber of repeated matches: ${num_repeated_matches}`);
}

// IMPORTANT!!! 💣
// only pass in true to make Matches if you want to
// annoy and send a bunch of people matches since Im using the prod db!
makeMatches(true);
