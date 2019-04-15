import {
  basicUser,
  findUserPriority,
  createSuitorAcceptorPool
} from '../create-suitor-acceptor-pool';

describe('createSuitorAcceptorPool(): ', () => {
  /**
   * case 1:
   *  given even pool --> should not be a fallback person
   *
   * case 2:
   *  given odd pool --> should be a fallback person
   *
   * case 3:
   *  each suitor's priorities should include every person in the acceptor pool
   *  each acceptor's priority should include every person in the suitor pool
   */

  /////////////////////
  // EVEN # of Matches
  ////////////////////
  it('should not return a fallback person for even # of users to match', () => {
    const usersToMatch = [
      { email: 'allison', prevMatches: [] },
      { email: 'bob', prevMatches: [] },
      { email: 'chris', prevMatches: [] },
      { email: 'dan', prevMatches: [] }
    ];
    const fallBackUser = {
      email: 'fallback',
      prevMatches: []
    };

    const { suitors, acceptors, fallBackMatch } = createSuitorAcceptorPool(
      usersToMatch,
      fallBackUser
    );

    expect(suitors.size).toBe(Math.floor(usersToMatch.length / 2));
    expect(acceptors.size).toBe(Math.floor(usersToMatch.length / 2));
    expect(fallBackMatch).toBeNull();
  });

  /////////////////////
  // ODD # of Matches
  ////////////////////
  it('should return a fallback person for odd # of users to match', () => {
    const usersToMatch = [
      { email: 'allison', prevMatches: [] },
      { email: 'bob', prevMatches: [] },
      { email: 'chris', prevMatches: [] }
    ];
    const fallBackUser = {
      email: 'fallback',
      prevMatches: []
    };

    const { suitors, acceptors, fallBackMatch } = createSuitorAcceptorPool(
      usersToMatch,
      fallBackUser
    );

    expect(suitors.size).toBe(Math.floor(usersToMatch.length / 2));
    expect(acceptors.size).toBe(Math.floor(usersToMatch.length / 2));
    expect(fallBackMatch).not.toBeNull();
  });

  it('should include a priority list for each suitor that includes users from acceptor pool', () => {
    const usersToMatch = [
      { email: 'allison', prevMatches: [] },
      { email: 'bob', prevMatches: [] },
      { email: 'chris', prevMatches: [] },
      { email: 'dan', prevMatches: [] }
    ];
    const fallBackUser = {
      email: 'fallback',
      prevMatches: []
    };
    const { suitors, acceptors, fallBackMatch } = createSuitorAcceptorPool(
      usersToMatch,
      fallBackUser
    );

    // TEST: check that each priority list for suitor, includes everyone from acceptor map
    suitors.forEach(suitor => {
      expect(suitor.priority.length).toBe(acceptors.size);

      // === DEBUGGING ===
      // console.log('Suitor:', suitor.data.email);
      // console.log(JSON.stringify(suitor.priority));

      suitor.priority.forEach(prefAcceptor => {
        expect(acceptors.has(prefAcceptor)).toBe(true);
      });
    });

    // TEST: check that each priority list for acceptor, includes everyone from suitor map
    acceptors.forEach(acceptor => {
      expect(acceptor.priority.length).toBe(suitors.size);
      // === DEBUGGING ===
      // console.log('Acceptor:', acceptor.data.email);
      // console.log(JSON.stringify(acceptor.priority));

      acceptor.priority.forEach(prefSuitor => {
        expect(suitors.has(prefSuitor)).toBe(true);
      });
    });
  });

  xit('should priorities users that one has not met with yet', () => {});
});
