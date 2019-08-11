import { createSuitorAcceptorPool } from '../create-suitor-acceptor-pool';

describe('createSuitorAcceptorPool(): ', () => {
  it('should not return a unmatched person for even # of users to match', () => {
    const usersToMatch = [
      { email: 'allison', prevMatches: [] },
      { email: 'bob', prevMatches: [] },
      { email: 'chris', prevMatches: [] },
      { email: 'dan', prevMatches: [] }
    ];

    const { suitors, acceptors, unmatchedUser } = createSuitorAcceptorPool(
      // @ts-ignore
      usersToMatch
    );

    expect(suitors.size).toBe(Math.floor(usersToMatch.length / 2));
    expect(acceptors.size).toBe(Math.floor(usersToMatch.length / 2));
    expect(unmatchedUser).toBeNull();
  });

  it('should return a unmatched person for odd # of users to match', () => {
    const usersToMatch = [
      { email: 'allison', prevMatches: [] },
      { email: 'bob', prevMatches: [] },
      { email: 'chris', prevMatches: [] }
    ];

    const { suitors, acceptors, unmatchedUser } = createSuitorAcceptorPool(
      // @ts-ignore
      usersToMatch
    );

    expect(suitors.size).toBe(Math.floor(usersToMatch.length / 2));
    expect(acceptors.size).toBe(Math.floor(usersToMatch.length / 2));
    expect(unmatchedUser).not.toBeNull();
  });

  it('should include a priority list for each suitor that includes users from acceptor pool', () => {
    const usersToMatch = [
      { email: 'allison', prevMatches: [] },
      { email: 'bob', prevMatches: [] },
      { email: 'chris', prevMatches: [] },
      { email: 'dan', prevMatches: [] }
    ];

    const { suitors, acceptors } = createSuitorAcceptorPool(
      // @ts-ignore
      usersToMatch
    );

    // TEST: check that each priority list for suitor, includes everyone from acceptor map
    suitors.forEach(suitor => {
      expect(suitor.priority.length).toBe(acceptors.size);

      suitor.priority.forEach(prefAcceptor => {
        expect(acceptors.has(prefAcceptor)).toBe(true);
      });
    });

    // TEST: check that each priority list for acceptor, includes everyone from suitor map
    acceptors.forEach(acceptor => {
      expect(acceptor.priority.length).toBe(suitors.size);

      acceptor.priority.forEach(prefSuitor => {
        expect(suitors.has(prefSuitor)).toBe(true);
      });
    });
  });

  xit('should priorities users that one has not met with yet', () => {});
});
