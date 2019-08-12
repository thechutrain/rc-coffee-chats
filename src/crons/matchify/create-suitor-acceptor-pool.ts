import { shuffle, cloneDeep } from 'lodash';

import * as mTypes from '../../matching-algo/stable-marriage-matching/marriage-types';

import {
  makeSuitorPool,
  makeAcceptorPool
} from '../../matching-algo/stable-marriage-matching/helper-fn-marriage';
import {
  UserWithPrevMatchRecord,
  PrevMatchRecord
} from '../../db/models/user_model';

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
  users: UserWithPrevMatchRecord[]
): {
  suitors: Map<mTypes.marriage_id, mTypes.Suitor<UserWithPrevMatchRecord>>;
  acceptors: Map<mTypes.marriage_id, mTypes.Acceptor<UserWithPrevMatchRecord>>;
  unmatchedUser: UserWithPrevMatchRecord | null;
} {
  const userCopy = cloneDeep(users);
  let unmatchedUser: null | UserWithPrevMatchRecord = null;
  if (!isEvenNumberUsers(userCopy)) {
    const randomIndex = Math.floor(Math.random() * userCopy.length);
    unmatchedUser = userCopy[randomIndex];
    userCopy.splice(randomIndex, 1);
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
    unmatchedUser
  };
}

export function isEvenNumberUsers(people: UserWithPrevMatchRecord[]): boolean {
  return people.length % 2 === 0;
}
