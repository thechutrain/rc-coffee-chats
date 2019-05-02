import { cloneDeep } from 'lodash';

import * as types from '../../types';
import { createSuitorAcceptorPool } from './create-suitor-acceptor-pool';
import { makeStableMarriageMatches } from '../../matching-algo/stable-marriage-matching/stable-marriage-algo';
import { Acceptor } from '../../matching-algo/stable-marriage-matching/marriage-types';
import { UserWithPrevMatchRecord } from '../../db/models/user_model';

export function makeTodaysMatches(db, runForReal) {
  const TODAYS_MATCHES: Array<
    [UserWithPrevMatchRecord, UserWithPrevMatchRecord]
  > = [];
  // Get Users to Match for Today:
  const usersToMatch = db.User.findUsersPrevMatchesToday();

  // Clear all the skip next match warnings for todays people
  if (runForReal) {
    db.User.clearTodaysSkippers();
  }
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
    is_admin: 0,
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

  return { TODAYS_MATCHES, fallBackMatch };
}
