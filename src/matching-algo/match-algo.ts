import { IUser, IpastMatchObj } from './matching-algo';
import { deepClone } from '../utils/clone';
import {
  filterForUniqueMatches,
  filterForPrevMatches,
  sortByOldestMatch,
  findAndRemoveUserFromPool
} from './matchingHelperFn';

export type Acceptor = {
  self: IUser;
  topSuitor: IUser;
  priority: IUser[];
};

export type Suitor = {
  self: IUser;
  priority: IUser[];
  currentlyAccepted: boolean;
};

export function trimAfterRank<T>(priorityList: T[], rank: number): T[] {
  priorityList.splice(rank + 1, priorityList.length - (rank + 1));

  return priorityList;
}

export function makeStableMarriageMatches(
  suitors: Map<string, Suitor>,
  acceptors: Map<string, Acceptor>
): Array<[IUser, IUser]> {
  if (suitors.size !== acceptors.size) {
    throw new Error('suitors and acceptor arrays not equal length');
  }

  const acceptedAcceptors = [];
  while (acceptedAcceptors.length !== acceptors.size) {
    for (const s of suitors.values()) {
      if (!s.currentlyAccepted && s.priority.length !== 0) {
        const potentialAcceptor = acceptors.get(s.priority[0].email);
        const rank = potentialAcceptor.priority.indexOf(s.self);
        // case 1: no current proposals --> accept
        if (!potentialAcceptor.topSuitor) {
          potentialAcceptor.topSuitor = s.self;
          acceptedAcceptors.push(potentialAcceptor);
          trimAfterRank(potentialAcceptor.priority, rank);
          s.currentlyAccepted = true;
        } else {
          const currentTopSuitorRank = potentialAcceptor.priority.indexOf(
            potentialAcceptor.topSuitor
          );
          // case 2: has proposal, but this suitor is worse or not in priority list --> so keep current proposal
          if (currentTopSuitorRank < rank || rank === -1) {
            s.priority.shift();
          } else {
            // case 3: has proposal, but this suitor is better --> set current proposal to this suitor, & get reference to previous suitor & set currentAccepted
            const rejectedSuitor = suitors.get(
              potentialAcceptor.topSuitor.email
            );
            rejectedSuitor.currentlyAccepted = false;

            potentialAcceptor.topSuitor = s.self;
            trimAfterRank(potentialAcceptor.priority, rank);
            s.currentlyAccepted = true;
          }
        }
      }
    }
  }

  // make matches from acceptors accepted suitors
  const matches: Array<[IUser, IUser]> = acceptedAcceptors.map(makeMatch);
  //   const matches = acceptedAcceptors.map((a: Acceptor) => {
  //     return [a.self, a.topSuitor];
  //   });

  return matches;
}

function makeMatch(a: Acceptor): [IUser, IUser] {
  return [a.self, a.topSuitor];
}

export function makeMatches(
  usersToMatch: IUser[],
  fallBackUser: IUser
): Array<[IUser, IUser]> {
  const matchedPairs = [];
  let poolAvailableUsers = deepClone(usersToMatch);
  // TODO: sort pool of Available users by user with the most # of prev matches

  while (poolAvailableUsers.length > 1) {
    let otherMatch: IUser;
    const currUnMatchedUser = poolAvailableUsers.shift(); // filter this out && return clone
    const { email, prevMatches } = currUnMatchedUser;

    // get all potential users they can match with (All the users )
    const possibleNewMatches = filterForUniqueMatches(
      prevMatches,
      poolAvailableUsers
    );

    // Ideal Case: Try to first match with a new person
    if (possibleNewMatches.length !== 0) {
      const i = Math.floor(Math.random() * possibleNewMatches.length);
      otherMatch = possibleNewMatches[i];
    } else {
      // 2nd Case: No available new matches for this user, so find the least recent match they had:
      const possiblePrevMatches = filterForPrevMatches(
        prevMatches,
        poolAvailableUsers
      );
      const sortedPrevMatches = sortByOldestMatch(possiblePrevMatches, email);

      if (sortedPrevMatches.length === 0) {
        throw new Error(
          `Cannot match a user if they do not have any prevMatches`
        );
      }

      otherMatch = sortedPrevMatches[0];
    }

    // filter otherMatch out of poolAvailableUsers
    poolAvailableUsers = findAndRemoveUserFromPool(
      otherMatch.email,
      poolAvailableUsers
    );
    matchedPairs.push([currUnMatchedUser, otherMatch]);
  }
  // Special Case: Odd number of people in pool, then match last user
  // with fallback person:
  if (poolAvailableUsers.length === 1) {
    const lastUnMatchedUser = poolAvailableUsers[0];
    matchedPairs.push([lastUnMatchedUser, fallBackUser]);

    return matchedPairs;
  }

  return matchedPairs;
}

export function _prevMatchingAlgo(
  emails: string[],
  pastMatches: IpastMatchObj[],
  oddNumberBackupEmails = ['oddEmail@rc.com']
): Array<[string, string]> {
  // Note: having the shuffling outside of matching algorithm will allow us to test
  // const unmatchedEmails = shuffle(emails);
  const unmatchedEmails = emails; //
  const newMatches = [];

  while (unmatchedEmails.length > 0) {
    const currentEmail = unmatchedEmails.shift();
    const pastMatchedEmails = pastMatches
      .filter(
        match => match.email1 === currentEmail || match.email2 === currentEmail
      ) // filter to current email's matches
      .sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date))) // sort oldest to newest, so if there is a conflict we can rematch with oldest first
      .map(match =>
        match.email1 === currentEmail ? match.email2 : match.email1
      ) // extract only the other person's email out of the results (drop currentEmail and date)
      // tslint:disable-next-line
      .filter(email => unmatchedEmails.includes(email)) // remove past matches who are not looking for a match today or who already got matched
      .filter((value, index, self) => self.indexOf(value) === index); // uniq emails // TODO: this should be a reduce that adds a match count to every email so we can factor that into matches

    // console.log("------- pastMatchedEmails: ");
    // console.log(pastMatchedEmails);
    // console.log("-----------------------");

    const availableEmails = unmatchedEmails.filter(
      // tslint:disable-next-line
      email => !pastMatchedEmails.includes(email)
    );

    if (availableEmails.length > 0) {
      // TODO: potentialy prioritize matching people from different batches
      newMatches.push([currentEmail, availableEmails[0]]);
      unmatchedEmails.splice(unmatchedEmails.indexOf(availableEmails[0]), 1);
    } else if (pastMatchedEmails.length > 0 && unmatchedEmails.length > 0) {
      newMatches.push([currentEmail, pastMatchedEmails[0]]);
      unmatchedEmails.splice(unmatchedEmails.indexOf(pastMatchedEmails[0]), 1);
    } else {
      // this should only happen on an odd number of emails
      // TODO: how to handle the odd person
      newMatches.push([
        currentEmail,
        oddNumberBackupEmails[
          Math.floor(Math.random() * oddNumberBackupEmails.length)
        ]
      ]);
    }
    // logger.info("<<<<<<", newMatches);
  }
  return newMatches;
}
