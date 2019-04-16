import { basicUser, findUserPriority } from '../create-suitor-acceptor-pool';

describe('findUserPriority(): ', () => {
  /**
   * each test should return a list that has the same length of input oppositePool as returned list
   * each person in the oppositePool should also be in the returned list
   * case1) where a uses has no prevMatches should return a shuffled list of original input
   * case 2) user who has prevMatch with everyone, should be returned a list of users based on the prevMatch
   */
  it('should return a list of user priorities of the same length', () => {
    const user_a = {
      email: 'a',
      prevMatches: []
    };
    const oppositePool = [
      { email: 'w_1', prevMatches: [] },
      { email: 'w_2', prevMatches: [] },
      { email: 'w_3', prevMatches: [] },
      { email: 'w_4', prevMatches: [] }
    ];

    const user_a_priority = findUserPriority<basicUser>(user_a, oppositePool);

    // TEST: make sure the returned priority list is the same length of given oppositePool
    expect(user_a_priority.length).toBe(oppositePool.length);

    // TEST: ensure the the priority list includes each person in the opposite pool
    oppositePool.forEach(oppositeUser => {
      expect(user_a_priority).toEqual(
        expect.arrayContaining([expect.objectContaining(oppositeUser)])
      );
    });
  });

  it('should return prevMatches, if user has matched with everyone in the opposite pool', () => {
    const user_a = {
      email: 'a',
      prevMatches: [
        {
          email: 'w_1'
        },
        {
          email: 'w_2'
        },
        {
          email: 'w_3'
        }
        // {
        //   email: 'I dont exist in the opposite pool of users'
        // }
      ]
    };
    const oppositePool = [
      { email: 'w_1', prevMatches: [] },
      { email: 'w_2', prevMatches: [] },
      { email: 'w_3', prevMatches: [] }
    ];

    const user_a_priority = findUserPriority<basicUser>(user_a, oppositePool);

    for (let i = 0; i < user_a_priority.length; i++) {
      expect(user_a_priority[i]).toEqual(oppositePool[i]);
    }

    // TEST: make sure the returned priority list is the same length of given oppositePool
    expect(user_a_priority.length).toBe(oppositePool.length);

    // TEST: ensure the the priority list includes each person in the opposite pool
  });

  it('should return prevMatches, if user has matched with everyone in the opposite pool and other non relative people as well', () => {
    const user_a = {
      email: 'a',
      prevMatches: [
        {
          email: 'w_1'
        },
        {
          email: 'w_2'
        },
        {
          email: 'w_3'
        },
        {
          email: 'I dont exist in the opposite pool of users'
        },
        {
          email: 'Another nonrelevant person'
        }
      ]
    };
    const oppositePool = [
      { email: 'w_1', prevMatches: [] },
      { email: 'w_2', prevMatches: [] },
      { email: 'w_3', prevMatches: [] }
    ];

    const user_a_priority = findUserPriority<basicUser>(user_a, oppositePool);

    for (let i = 0; i < user_a_priority.length; i++) {
      expect(user_a_priority[i]).toEqual(oppositePool[i]);
    }

    // console.log(user_a_priority);

    // TEST: make sure the returned priority list is the same length of given oppositePool
    expect(user_a_priority.length).toBe(oppositePool.length);

    // TEST: ensure the the priority list includes each person in the opposite pool
  });

  it('should priorities users that one has not met with yet', () => {
    const user_a = {
      email: 'a',
      prevMatches: [
        {
          email: 'w_1'
        }
      ]
    };
    const oppositePool = [
      { email: 'w_1', prevMatches: [] },
      { email: 'unique match 1', prevMatches: [] },
      { email: 'unique match 2', prevMatches: [] }
    ];

    const priority = findUserPriority<basicUser>(user_a, oppositePool);

    const last_index = priority.length - 1;
    expect(priority[last_index].email).toBe('w_1');
  });
});
