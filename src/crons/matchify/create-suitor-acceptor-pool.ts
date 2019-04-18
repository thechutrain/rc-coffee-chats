/**
 * find user who hasn't matched with
 */
import { shuffle, cloneDeep } from 'lodash';

import * as mTypes from '../../matching-algo/stable-marriage-matching/marriage-types';
// import { PrevMatchRecord } from '../../db/models/user_model';

import {
  makeSuitorPool,
  makeAcceptorPool
} from '../../matching-algo/stable-marriage-matching/helper-fn-marriage';
import {
  UserWithPrevMatchRecord,
  PrevMatchRecord
} from '../../db/models/user_model';
// export type basicPrevMatch = {
//   email: string;
//   date?: string;
// };
// export type basicUser = {
//   email: string;
//   prevMatches: basicPrevMatch[];
// };

// ✅ tested!
export function findUserPriority(
  currUser: UserWithPrevMatchRecord,
  _requiredUsersForPriority: UserWithPrevMatchRecord[]
): UserWithPrevMatchRecord[] {
  const requiredUsers: UserWithPrevMatchRecord[] = cloneDeep(
    _requiredUsersForPriority
  );
  const uniqueMatches: UserWithPrevMatchRecord[] = [];
  const nonUniqueMatches: UserWithPrevMatchRecord[] = [];

  // Note: SQL query returns prevMatches based on last date, preserve this order
  currUser.prevMatches.forEach((prevMatch: PrevMatchRecord) => {
    // Note: current user's previous match may or may not be in the pool of requiredUsersForPriority since they are split randomly into two separate sets
    const prevMatchEmail = prevMatch.email;
    let prevMatchFound = -1;
    for (let i = 0; i < requiredUsers.length; i++) {
      if (prevMatchEmail === requiredUsers[i].email) {
        prevMatchFound = i;
        break;
      }
    }

    if (prevMatchFound !== -1) {
      // Note: if a user from the requiredUserPool is found as a previous match of currUser, then remove them from the requiredUser list & put them into the prevMatch
      nonUniqueMatches.push(requiredUsers.splice(prevMatchFound, 1)[0]);
    }
  });

  return [...shuffle(requiredUsers), ...nonUniqueMatches];
}

// ✅ tested!1
export function createSuitorAcceptorPool(
  users: UserWithPrevMatchRecord[],
  fallBackPerson: UserWithPrevMatchRecord
): {
  suitors: Map<mTypes.marriage_id, mTypes.Suitor<UserWithPrevMatchRecord>>;
  acceptors: Map<mTypes.marriage_id, mTypes.Acceptor<UserWithPrevMatchRecord>>;
  fallBackMatch: UserWithPrevMatchRecord | null;
} {
  const userCopy = cloneDeep(users);
  let fallBackMatch: null | UserWithPrevMatchRecord = null;
  if (!isEvenNumberUsers(userCopy)) {
    // TODO: Improved feature that removes a user who hasn't matched with fallback person!
    const fallBackIndex = findFallBackMatch(userCopy, fallBackPerson);
    fallBackMatch = userCopy.splice(fallBackIndex, 1)[0];
  }

  const shuffledUsers = shuffle(userCopy);
  const secondHalf = shuffledUsers.splice(0, shuffledUsers.length / 2);
  const firstHalf = shuffledUsers;

  const suitors = makeSuitorPool(
    firstHalf,
    'email',
    findUserPriority,
    secondHalf
  );

  const acceptors = makeAcceptorPool(
    secondHalf,
    'email',
    findUserPriority,
    firstHalf
  );

  return {
    suitors,
    acceptors,
    fallBackMatch
  };
}

/**
 * ✳️ EDGE CASE: if the fallbackPerson isn't someone who was suppose to be
 *  matched for today, they will not show up in another one's previous matches
 *
 *  TODO: Need to fix the sql query for getting prevMatches!
 *
 *
 */
export function findFallBackMatch(
  people: UserWithPrevMatchRecord[],
  fallBackPerson: UserWithPrevMatchRecord
): number {
  // let match: A | null = null;
  for (let i = people.length - 1; i >= 0; i--) {
    let haveMatched = false;
    for (const prevMatch of people[i].prevMatches) {
      if (prevMatch.email === fallBackPerson.email) {
        haveMatched = true;
        break;
      }
    }

    if (!haveMatched) {
      return i;
    }
  }

  return 0;
}

export function isEvenNumberUsers(people: UserWithPrevMatchRecord[]): boolean {
  return people.length % 2 === 0;
}
