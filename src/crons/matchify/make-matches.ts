import { cloneDeep } from 'lodash';

import * as types from '../../types';
import { createSuitorAcceptorPool } from './create-suitor-acceptor-pool';
import { makeStableMarriageMatches } from '../../matching-algo/stable-marriage-matching/stable-marriage-algo';
import {
  UserWithPrevMatchRecord,
  UserRecord,
  matchPair
} from '../../db/models/user_model';

export function makeMatches(
  db: types.myDB
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
  // TODO: put this into separate function
  const fallBackEmail = db.Config.getFallBackUser();
  const fallBackUserRecord = db.User.findByEmail(fallBackEmail);
  const fallBackPrevMatches = db.User._findPrevActiveMatches(
    fallBackUserRecord.id
  );
  const fallBackUser = {
    ...fallBackUserRecord,
    prevMatches: fallBackPrevMatches,
    num_matches: fallBackEmail.length
  };

  // PREP for stable marriage algorithm.
  const { suitors, acceptors, fallBackMatch } = createSuitorAcceptorPool(
    usersToMatch,
    fallBackUser
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

  if (fallBackMatch !== null) {
    todaysMatches.push([fallBackUser, fallBackMatch]);
  }

  return { todaysMatches, fallBackMatch };
}
