import { IUser, prevMatch } from './matching-algo';
import { deepClone } from '../utils/clone';

export function filterForUniqueMatches(
  prevMatches: prevMatch[],
  poolOfAvailableUsers: IUser[]
): IUser[] {
  return poolOfAvailableUsers.filter((availableUser: IUser) => {
    const { email: availableEmail } = availableUser;

    const wasPrevMatch = prevMatches.some(({ email: prevMatchEmail }) => {
      return prevMatchEmail === availableEmail;
    });

    return !wasPrevMatch;
  });
}
export function filterForPrevMatches(
  prevMatches: prevMatch[],
  poolOfAvailableUsers: IUser[]
): IUser[] {
  return poolOfAvailableUsers.filter((availableUser: IUser) => {
    const { email: availableEmail } = availableUser;

    const wasPrevMatch = prevMatches.some(({ email: prevMatchEmail }) => {
      return prevMatchEmail === availableEmail;
    });

    return wasPrevMatch;
  });
}

export function sortByOldestMatch(
  poolPrevMatches: IUser[],
  emailToSortMatchesBy: string
): IUser[] {
  function getMatchDate(user: IUser): prevMatch {
    const foundMatch = user.prevMatches.find(
      match => match.email === emailToSortMatchesBy
    );

    if (!foundMatch) {
      throw new Error(
        `Could not find a previous match of "${emailToSortMatchesBy}" on given user: ${JSON.stringify(
          user
        )}`
      );
    }

    return foundMatch;
  }

  return poolPrevMatches.sort((a: IUser, b: IUser) => {
    const { matchDate: dateA } = getMatchDate(a);
    const { matchDate: dateB } = getMatchDate(b);
    if (dateA < dateB) {
      return -1;
    }
    if (dateA > dateB) {
      return 1;
    } else {
      return 0;
    }
  });
}

export function findAndRemoveUserFromPool(
  userEmail: string,
  poolOfAvailableUsers: IUser[]
): IUser[] {
  const newPoolOfAvailableUsers = [];
  for (const availableUser of poolOfAvailableUsers) {
    if (availableUser.email !== userEmail) {
      newPoolOfAvailableUsers.push(deepClone(availableUser));
    }
  }

  return newPoolOfAvailableUsers;
}

// TODO: write a fn to sort pool of available users to get user with most number of previous matches first ...
// export function sortByFewestPrevMatches();
