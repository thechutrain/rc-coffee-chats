import { makeMatches } from '../matchAlgo';

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
    const receivedValue = makeMatches(usersToMatch, [fallBackUser]);
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
    const arrUserMatches = makeMatches(usersToMatch, [fallBackUser]);
    const expectedValue = [[userA, userB]];
    // arrUserMatches.forEach((matchPair) => {
    //   expect(matchPair[0]).not.toBe()
    // })

    expect(arrUserMatches).toEqual(expectedValue);
  });

  it('odd # of users should not return the fallback person', () => {
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
    const userC = {
      email: 'C',
      full_name: 'THird user',
      prevMatches: []
    };
    const usersToMatch = [userA, userB, userC];
    const receivedValue = makeMatches(usersToMatch, [fallBackUser]);
    const expectedValue = [[userA, userB], [userC, fallBackUser]];

    expect(receivedValue).toEqual(expectedValue);
  });

  // it('odd # of users should return the fallback person', () => {
  //   const arrEmailsToMatch = ['a', 'b', 'c'];
  //   const allPastMatches = [];
  //   const receivedValue = _prevMatchingAlgo(arrEmailsToMatch, allPastMatches, [
  //     'odd'
  //   ]);
  //   const expectedValue = [['a', 'b'], ['c', 'odd']];

  //   expect(receivedValue).toEqual(expectedValue);
  // });

  // it('respects previous matches for first user that it tries to match', () => {
  //   const arrEmailsToMatch = ['a', 'b', 'c'];
  //   const allPastMatches = [
  //     {
  //       date: '2019-01-25',
  //       email1: 'a',
  //       email2: 'b'
  //     }
  //   ];
  //   const receivedValue = _prevMatchingAlgo(arrEmailsToMatch, allPastMatches, [
  //     'odd'
  //   ]);
  //   const expectedValue = [['a', 'c'], ['b', 'odd']];

  //   expect(receivedValue).toEqual(expectedValue);
  // });
});
