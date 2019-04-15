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
import { deepClone } from '../../utils/clone';

export type basicPrevMatch = {
  email: string;
  date?: string;
};
export type basicUser = {
  email: string;
  prevMatches: basicPrevMatch[];
};

export function findUserPriority<U extends basicUser, E>(
  currUser: U,
  oppositePool: E[]
): E[] {
  const requiredEmails = deepClone(oppositePool);
  const uniqueMatches = [];
  const prevMatches = [];

  // Note: SQL query returns prevMatches based on last date, preserve this order
  // when making a user's priority
  currUser.prevMatches.forEach((prevMatch: basicPrevMatch) => {
    const { email } = prevMatch;
    // Check if this email is in the requireEmails
    const indexOfMatch = requiredEmails.indexOf(email);

    if (indexOfMatch >= 0) {
      prevMatches.push(email);
      requiredEmails.splice(indexOfMatch, 1); // also remove them from requiredEmails
    }
  });

  return [...shuffle(requiredEmails), ...prevMatches];
}

export function createSuitorAcceptorPool<A extends basicUser>(
  users: A[],
  fallBackPerson: A
): {
  suitors: Map<mTypes.marriage_id, mTypes.Suitor<A>>;
  acceptors: Map<mTypes.marriage_id, mTypes.Acceptor<A>>;
  fallBackMatch: A | null;
} {
  const userCopy = cloneDeep(users);
  let fallBackMatch: null | A = null;
  if (!isEvenNumberUsers(userCopy)) {
    // TODO: Improved feature that removes a user who hasn't matched with fallback person!
    fallBackMatch = userCopy.splice(users.length - 1, 1)[0];
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

/** TODO: findFallBackMatch
 *
 */

// export function findFallBackMatch<A extends basicUser>(
//   people: A[],
//   fallBackPerson: A
// ) {
//   let i = people.length - 1;
// }

export function isEvenNumberUsers<A>(people: A[]): boolean {
  return people.length % 2 === 0;
}
