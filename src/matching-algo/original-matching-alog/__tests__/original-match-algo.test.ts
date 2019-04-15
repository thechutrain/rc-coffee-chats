import { makeMatches } from '../original-match-algo';

let fallBackUser;

beforeEach(() => {
  fallBackUser = Object.freeze({
    email: 'Alan',
    full_name: ':(',
    prevMatches: ['no one']
  });
});

describe('New version of Matching Algo', () => {
  it('empty emails to match and no past matches should give us no matched users', () => {
    const usersToMatch = [];
    const receivedValue = makeMatches(usersToMatch, fallBackUser);
    const expectedValue = [];

    expect(receivedValue).toEqual(expectedValue);
  });

  it('even # of users should not return the fallback person', () => {
    const userA = {
      email: 'A',
      full_name: 'First User',
      prevMatches: []
    };
    const userB = {
      email: 'B',
      full_name: 'Second User',
      prevMatches: []
    };
    const usersToMatch = [userA, userB];
    const arrUserMatches = makeMatches(usersToMatch, fallBackUser);
    const expectedValue = [[userA, userB]];
    // arrUserMatches.forEach((matchPair) => {
    //   expect(matchPair[0]).not.toBe()
    // })

    expect(arrUserMatches).toEqual(expectedValue);
  });

  it('odd # of users the fallback person should be used', () => {
    const userA = {
      email: 'A',
      full_name: 'First User',
      prevMatches: []
    };

    const usersToMatch = [userA];
    const receivedValue = makeMatches(usersToMatch, fallBackUser);
    const expectedValue = [[userA, fallBackUser]];

    expect(receivedValue).toEqual(expectedValue);
  });
});
