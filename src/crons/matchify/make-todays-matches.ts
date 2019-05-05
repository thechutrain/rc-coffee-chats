import { cloneDeep } from 'lodash';

import { createSuitorAcceptorPool } from './create-suitor-acceptor-pool';
import { makeStableMarriageMatches } from '../../matching-algo/stable-marriage-matching/stable-marriage-algo';
import {
  UserWithPrevMatchRecord,
  UserRecord,
  matchPair
} from '../../db/models/user_model';

export function makeMatches(
  db
  // date?: string // for testing purposes?
): {
  todaysMatches: matchPair[];
  fallBackMatch: UserWithPrevMatchRecord | null;
} {
  // Get Users to Match for Today:
  const usersToMatch = db.User.findUsersPrevMatchesToday();

  ////////////////////////////////////////
  // Stable Marriage Algorithm
  ////////////////////////////////////////
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

  // PREP for stable marriage algorithm.
  const { suitors, acceptors, fallBackMatch } = createSuitorAcceptorPool(
    usersToMatch,
    fallBackUser
  );

  const acceptorSuitorMatches = makeStableMarriageMatches(
    cloneDeep(suitors),
    cloneDeep(acceptors)
  );

  acceptorSuitorMatches.forEach(acceptorSuitorMatch => {
    const acceptor = acceptorSuitorMatch[0];
    const suitor = acceptorSuitorMatch[1];
    todaysMatches.push([acceptor.data, suitor.data]);
  });

  const todaysMatches = acceptorSuitorMatches.map(match => {
    // NOTE: necessary for TS, since tuples are not inferred!
    const matchPairData: matchPair = [match[0].data, match[1].data];
    return matchPairData;
  });

  if (fallBackMatch !== null) {
    todaysMatches.push([fallBackUser, fallBackMatch]);
  }

  return { todaysMatches, fallBackMatch };
}
