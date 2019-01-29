import { email, IUser, IpastMatchObj, prevMatch } from './matching-algo';

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

export function sortByOldestMatch(prevMatches: prevMatch[]): prevMatch[] {
  return [];
}

// ==========================================
// TODO: Make this more generic, pass in a flag to determine whether I want unique or prev matched users
// filterForUniqueMatches
export function findUniqueMatches(
  prevMatches: prevMatch[],
  poolOfAvailableUsers: IUser[]
): IUser[] {
  if (prevMatches.length === 0) {
    return poolOfAvailableUsers;
  }

  return poolOfAvailableUsers.filter(currUnmatchedUser => {
    // if any of the prevMatches are the same as currUnmatchedUser,
    // then return false (filter it out of the pool)
    return !prevMatches.some((currPrevMatch: prevMatch) => {
      const { email: prevMatchEmail } = currPrevMatch;
      return prevMatchEmail === currUnmatchedUser.email;
    });
  });
}

export function filterUserPool(
  prevMatches: prevMatch[],
  poolOfAvailableUsers: IUser[],
  filterBy
): IUser[] {
  if (prevMatches.length === 0) {
    return poolOfAvailableUsers;
  }

  return poolOfAvailableUsers.filter(currUnmatchedUser => {
    // if any of the prevMatches are the same as currUnmatchedUser,
    // then return false (filter it out of the pool)
    return !prevMatches.some((currPrevMatch: prevMatch) => {
      const { email: prevMatchEmail } = currPrevMatch;
      return prevMatchEmail === currUnmatchedUser.email;
    });
  });
}

// Returns an array of users, ordered by the least most recently matched user first
export function getLeastRecentMatches(
  prevMatches: prevMatch[],
  poolOfMatches: IUser[]
): IUser[] {
  return [];
}
