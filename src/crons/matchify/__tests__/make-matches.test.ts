import { stableMarriageMatcher } from '../make-matches';

// Mock Data:
let userAl;
let userBob;
let userCat;

describe('make-matches test:', () => {
  beforeAll(() => {
    // Mocks
    userAl = {
      id: 1,
      email: 'al@email.com',
      full_name: 'al',
      coffee_days: '12',
      warning_exception: 1,
      skip_next_match: 0,
      is_active: 1,
      is_faculty: 0,
      is_admin: 0,
      prevMatches: [],
      num_matches: 0
    };

    userBob = {
      id: 1,
      email: 'bob@email.com',
      full_name: 'bob',
      coffee_days: '12',
      warning_exception: 1,
      skip_next_match: 0,
      is_active: 1,
      is_faculty: 0,
      is_admin: 0,
      prevMatches: [],
      num_matches: 0
    };

    userCat = {
      id: 1,
      email: 'cat@email.com',
      full_name: 'cat',
      coffee_days: '12',
      warning_exception: 1,
      skip_next_match: 0,
      is_active: 1,
      is_faculty: 0,
      is_admin: 0,
      prevMatches: [],
      num_matches: 0
    };
  });

  it('should only have pairs of two for an even number of users to match', () => {
    const { todaysMatches, unmatchedUser } = stableMarriageMatcher([
      userAl,
      userBob
    ]);
    expect(todaysMatches.length).toBe(1);
    expect(todaysMatches[0].length).toBe(2);
    expect(unmatchedUser).toBeNull();
  });

  it('should have a single pair of three for an odd number of users to match', () => {
    const { todaysMatches, unmatchedUser } = stableMarriageMatcher([
      userAl,
      userBob,
      userCat
    ]);

    expect(todaysMatches.length).toBe(1);
    expect(todaysMatches[0].length).toBe(3);
    expect(unmatchedUser).toBeNull();
  });

  it('should not return any match pairs if there is only a single user', () => {
    const { todaysMatches, unmatchedUser } = stableMarriageMatcher([userAl]);

    expect(todaysMatches.length).toBe(0);
    expect(unmatchedUser).toEqual(userAl);
  });

  it('should not return any match pairs if there are no users', () => {
    const { todaysMatches, unmatchedUser } = stableMarriageMatcher([]);

    expect(todaysMatches.length).toBe(0);
    expect(unmatchedUser).toBeNull();
  });
});
