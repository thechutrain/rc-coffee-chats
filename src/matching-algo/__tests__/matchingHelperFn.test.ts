import {
  filterForUniqueMatches,
  filterForPrevMatches,
  sortByOldestMatch,
  findAndRemoveUserFromPool
} from '../matchingHelperFn';
import { IUser, IpastMatchObj, prevMatch } from '../matching-algo';

// const currUser: IUser = Object.freeze({
//   email: 'test@rc.com',
//   full_name: 'test email',
//   prevMatches: []
// });
describe('match-algo-helper-fn: filterForUniqueMatches', () => {
  it('should return not return any users if no available users', () => {
    const prevMatches: prevMatch[] = [];
    const poolOfAvailableUsers: IUser[] = [];

    const received = filterForUniqueMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([]);
  });
  it('should not return any user, if only available user was a prev match', () => {
    const dateOfMatch = new Date(1);
    const userA: IUser = {
      email: 'a@rc.com',
      full_name: 'a test',
      prevMatches: [
        {
          matchDate: dateOfMatch,
          email: 'b@rc.com'
        }
      ]
    };
    const userB: IUser = {
      email: 'b@rc.com',
      full_name: 'b test',
      prevMatches: [
        {
          matchDate: dateOfMatch,
          email: 'a@rc.com'
        }
      ]
    };
    const prevMatches: prevMatch[] = userB.prevMatches; // Looking for B's unique matches
    const poolOfAvailableUsers: IUser[] = [userA];

    const received = filterForUniqueMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([]);
  });

  it('should return the only available user if they were not a previous match', () => {
    const dateOfMatch = new Date(1);
    const userA: IUser = {
      email: 'a@rc.com',
      full_name: 'a test',
      prevMatches: []
    };
    const userB: IUser = {
      email: 'b@rc.com',
      full_name: 'b test',
      prevMatches: []
    };
    const prevMatches: prevMatch[] = userB.prevMatches; // prevMatches of userB
    const poolOfAvailableUsers: IUser[] = [userA];

    const received = filterForUniqueMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([userA]);
  });
});

describe('match-algo-helper-fn: filterForPrevMatches', () => {
  it('should not return any users if no available users', () => {
    const prevMatches: prevMatch[] = [];
    const poolOfAvailableUsers: IUser[] = [];

    const received = filterForPrevMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([]);
  });

  it('should not return any users, if the only availabe user was not a prev match', () => {
    const dateOfMatch = new Date(1);
    const userA: IUser = {
      email: 'a@rc.com',
      full_name: 'a test',
      prevMatches: []
    };
    const userB: IUser = {
      email: 'b@rc.com',
      full_name: 'b test',
      prevMatches: []
    };
    const prevMatches: prevMatch[] = userB.prevMatches; // Looking for B's unique matches
    const poolOfAvailableUsers: IUser[] = [userA];

    const received = filterForPrevMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([]);
  });
  it('should return the available user if that user was a prev match', () => {
    const dateOfMatch = new Date(1);
    const userA: IUser = {
      email: 'a@rc.com',
      full_name: 'a test',
      prevMatches: [
        {
          matchDate: dateOfMatch,
          email: 'b@rc.com'
        }
      ]
    };
    const userB: IUser = {
      email: 'b@rc.com',
      full_name: 'b test',
      prevMatches: [
        {
          matchDate: dateOfMatch,
          email: 'a@rc.com'
        }
      ]
    };
    const prevMatches: prevMatch[] = userB.prevMatches; // Looking for B's unique matches
    const poolOfAvailableUsers: IUser[] = [userA];

    const received = filterForPrevMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([userA]);
  });
  // it('should not be able to return any one outside of the available users if that user was a prev match', () => {});
});

describe('sort prev matches: match-algo-helper-fn', () => {
  it('should return an empty list of prevMatch if none', () => {
    const poolPrevMatches = [];
    const emailToSortBy = 'a@gmail.com';
    expect(sortByOldestMatch(poolPrevMatches, emailToSortBy)).toEqual([]);
  });

  it('should return a single prevMatch if theres only a single prevMatch', () => {
    const dateOfMatchAB = new Date(1);
    const userA: IUser = {
      email: 'a@rc.com',
      full_name: 'a test',
      prevMatches: [
        {
          matchDate: dateOfMatchAB,
          email: 'b@rc.com'
        }
      ]
    };

    const poolPrevMatches: IUser[] = [userA];
    const emailToSortBy = 'b@rc.com.com';
    const sortedPrevMatches = sortByOldestMatch(poolPrevMatches, emailToSortBy);
    expect(sortedPrevMatches).toEqual([userA]);
  });

  it('should return a sorted list of prevMatch for two matches', () => {
    const dateOfMatchAC = new Date(1);
    const dateOfMatchBC = new Date(999);
    const userA: IUser = {
      email: 'a@rc.com',
      full_name: 'a test',
      prevMatches: [
        {
          matchDate: dateOfMatchAC,
          email: 'c@rc.com'
        }
      ]
    };
    const userB: IUser = {
      email: 'b@rc.com',
      full_name: 'b test',
      prevMatches: [
        {
          matchDate: dateOfMatchBC,
          email: 'c@rc.com'
        }
      ]
    };

    const poolPrevMatches = [userA, userB];
    const emailToSortBy = 'c@rc.com';
    const sortedPrevMatches = sortByOldestMatch(poolPrevMatches, emailToSortBy);

    expect(sortedPrevMatches).toEqual([userA, userB]);
  });

  it('should return a sorted list of prevMatch for two matches in reverse order', () => {
    const dateOfMatchAC = new Date(1);
    const dateOfMatchBC = new Date(999);
    const userA: IUser = {
      email: 'a@rc.com',
      full_name: 'a test',
      prevMatches: [
        {
          matchDate: dateOfMatchAC,
          email: 'c@rc.com'
        }
      ]
    };
    const userB: IUser = {
      email: 'b@rc.com',
      full_name: 'b test',
      prevMatches: [
        {
          matchDate: dateOfMatchBC,
          email: 'c@rc.com'
        }
      ]
    };

    const poolPrevMatches = [userB, userA];
    const emailToSortBy = 'c@rc.com';
    const sortedPrevMatches = sortByOldestMatch(poolPrevMatches, emailToSortBy);

    expect(sortedPrevMatches).toEqual([userA, userB]);
  });

  // it('should return a sorted list of prevMatch for more than two matches', () => {
  //   const match1: prevMatch = {
  //     email: 'a',
  //     matchDate: new Date(11)
  //   };
  //   const match2: prevMatch = {
  //     email: 'b',
  //     matchDate: new Date(22)
  //   };
  //   const match3: prevMatch = {
  //     email: 'c',
  //     matchDate: new Date(33)
  //   };
  //   const match4: prevMatch = {
  //     email: 'd',
  //     matchDate: new Date(44)
  //   };

  //   const prevMatches = [match3, match4, match2, match1];
  //   const sortedMatches = sortByOldestMatch(prevMatches);
  //   let prevDate = new Date(0);
  //   sortedMatches.forEach(match => {
  //     expect(prevDate < match.matchDate).toBe(true);
  //     prevDate = match.matchDate;
  //   });
  // });
});

describe('findAndRemoveUserFromPool', () => {
  it('should be able to remove user from available pool', () => {
    const userA = {
      email: 'a@gmail.com',
      full_name: 'a test',
      prevMatches: []
    };
    const userB = {
      email: 'b@gmail.com',
      full_name: 'b test',
      prevMatches: []
    };
    const poolOfUsers: IUser[] = [userA, userB];

    const newPool = findAndRemoveUserFromPool('a@gmail.com', poolOfUsers);

    expect(newPool).toEqual([userB]);
  });
  it('should return the same sized pool if email not found', () => {
    const userA = {
      email: 'a@gmail.com',
      full_name: 'a test',
      prevMatches: []
    };
    const userB = {
      email: 'b@gmail.com',
      full_name: 'b test',
      prevMatches: []
    };
    const poolOfUsers: IUser[] = [userA, userB];

    const newPool = findAndRemoveUserFromPool('unavailable', poolOfUsers);

    expect(newPool).toEqual(poolOfUsers);
    expect(newPool).not.toBe(poolOfUsers);
  });
});
