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
  return prevMatches.sort((a: prevMatch, b: prevMatch) => {
    if (a.matchDate < b.matchDate) {
      return -1;
    }
    if (a.matchDate > b.matchDate) {
      return 1;
    } else {
      return 0;
    }
  });
}
