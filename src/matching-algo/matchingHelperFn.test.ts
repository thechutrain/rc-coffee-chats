import { findUniqueMatches } from './matchingHelperFn';
import { IUser, IpastMatchObj } from './matching-algo';

describe('matching algorithm helper functions', () => {
  it('should not find any new matched pairs from empty pool of unmatched users ', () => {
    const currUser: IUser = Object.freeze({
      email: 'test@rc.com',
      full_name: 'test email',
      prevMatches: []
    });
    const poolOfUnmatchedUsers = [];

    const { prevMatches } = currUser;

    const newMatchedPairs = findUniqueMatches(
      prevMatches,
      poolOfUnmatchedUsers
    );

    expect(newMatchedPairs).toEqual([]);
  });

  it('should return everyone in the pool of unmatched users, if user has no previous matches', () => {
    const currUser: IUser = Object.freeze({
      email: 'test@rc.com',
      full_name: 'test email',
      prevMatches: []
    });
    const poolOfUnMatchedUsers: IUser[] = [
      {
        email: 'a@rc.com',
        full_name: 'a bot',
        prevMatches: []
      },
      {
        email: 'b@rc.com',
        full_name: 'b bot',
        prevMatches: []
      }
    ];

    const { prevMatches } = currUser;

    const newMatchedPairs = findUniqueMatches(
      prevMatches,
      poolOfUnMatchedUsers
    );

    expect(newMatchedPairs).toEqual(poolOfUnMatchedUsers);
  });

  it('should find only the the user that they were not matched with', () => {
    const userA = {
      email: 'a@rc.com',
      full_name: 'a bot',
      prevMatches: []
    };
    const userB = {
      email: 'b@rc.com',
      full_name: 'b bot',
      prevMatches: []
    };
    const currUser: IUser = Object.freeze({
      email: 'test@rc.com',
      full_name: 'test email',
      prevMatches: [userA.email]
    });
    const poolOfUnMatchedUsers: IUser[] = [userA, userB];

    const { prevMatches } = currUser;

    const newMatchedPairs = findUniqueMatches(
      prevMatches,
      poolOfUnMatchedUsers
    );

    expect(newMatchedPairs).toEqual([userB]);
  });
});
