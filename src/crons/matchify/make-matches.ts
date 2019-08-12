import { cloneDeep } from 'lodash';

import * as types from '../../types';
import { createSuitorAcceptorPool } from './create-suitor-acceptor-pool';
import { makeStableMarriageMatches } from '../../matching-algo/stable-marriage-matching/stable-marriage-algo';
import { matchPair, UserWithPrevMatchRecord } from '../../db/models/user_model';

export function makeMatches(
  db: types.myDB,
  weekday: types.WEEKDAY
): {
  todaysMatches: matchPair[];
  unmatchedUser: UserWithPrevMatchRecord | null;
} {
  const usersToMatch = getUsersToMatchToday(db, weekday);
  return stableMarriageMatcher(usersToMatch);
}

export function getUsersToMatchToday(db: types.myDB, weekday: types.WEEKDAY) {
  return db.User.findUsersPrevMatchesToday(weekday);
}

// ✅ Tests written
export function stableMarriageMatcher(usersToMatch: UserWithPrevMatchRecord[]) {
  const { suitors, acceptors, unmatchedUser } = createSuitorAcceptorPool(
    usersToMatch
  );

  // Stable Marriage Algo to make matches
  const acceptorSuitorMatches = makeStableMarriageMatches(
    cloneDeep(suitors),
    cloneDeep(acceptors)
  );

  const todaysMatches = acceptorSuitorMatches.map(match => {
    // NOTE: necessary for TS, since tuples are not inferred!
    const matchPairData: matchPair = [match[0].data, match[1].data];
    return matchPairData;
  });

  if (unmatchedUser && todaysMatches.length) {
    todaysMatches[todaysMatches.length - 1].push(unmatchedUser);

    return {
      todaysMatches,
      unmatchedUser: null
    };
  }

  return {
    todaysMatches,
    unmatchedUser
  };
}
