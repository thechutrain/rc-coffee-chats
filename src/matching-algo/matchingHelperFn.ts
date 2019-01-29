import { email, IUser, IpastMatchObj } from './matching-algo';

export function findUniqueMatches(
  prevMatches: email[],
  poolOfUnmatchedUsers: IUser[]
): IUser[] {
  if (prevMatches.length === 0) {
    return poolOfUnmatchedUsers;
  }

  return poolOfUnmatchedUsers.filter(currUnmatchedUser => {
    // if any of the prevMatches are the same as currUnmatchedUser,
    // then return false (filter it out of the pool)
    return !prevMatches.some((prevMatchEmail: email) => {
      return prevMatchEmail === currUnmatchedUser.email;
    });
  });
}

export function getLeastRecentMatch(
  userEmail: email,
  prevMatches: email[],
  poolOfMatches: IUser[]
): email {
  return '';
}
