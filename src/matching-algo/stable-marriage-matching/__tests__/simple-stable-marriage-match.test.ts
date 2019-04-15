import { marriage_id, Acceptor, Suitor } from '../marriage-types';
import { makeStableMarriageMatches } from '../stable-marriage-algo';
import { makeSuitorPool, makeAcceptorPool } from '../helper-fn-marriage';
import cloneDeep from 'lodash/cloneDeep';
import { men, women, person } from './mock_data/set_1_data';

describe('Stable Marriage Match Algo!!', () => {
  it('should throw an error if suitors and acceptors are different sizes', () => {
    const pool_men = cloneDeep(men);
    const pool_women = cloneDeep(women);
    pool_women.splice(1, 1);
    expect(pool_men.length).not.toEqual(pool_women.length);
    const defaultFindPriorities = (a: any, b: any[]) => b;

    const suitorPool = makeSuitorPool<person>(
      pool_men,
      '_id',
      defaultFindPriorities,
      pool_women
    );

    const acceptorPool = makeAcceptorPool<person>(
      pool_women,
      '_id',
      defaultFindPriorities,
      pool_men
    );
    let error = null;
    try {
      const matches = makeStableMarriageMatches(suitorPool, acceptorPool);
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
  });

  it('should find stable match in a pool of users, where all men & women have the same priorities', () => {
    const pool_men = cloneDeep(men);
    const pool_women = cloneDeep(women);

    const suitor_pool = makeSuitorPool<person>(
      pool_men,
      '_id',
      (_, b) => b,
      pool_women
    );

    const acceptor_pool = makeAcceptorPool<person>(
      pool_women,
      '_id',
      (_, b) => b.reverse(),
      pool_men
    );

    const matches = makeStableMarriageMatches<person>(
      suitor_pool,
      acceptor_pool
    );

    matches.forEach((matchPair: [Acceptor<person>, Suitor<person>]) => {
      const acceptor = matchPair[0];
      const suitor = matchPair[1];
      expect(acceptor.topSuitor).toBe(suitor.marriage_id);
      /**
       *  Most sought after suitor, should be matched with top choice: 4--> 11
       *  Second most sought after suitor, should be matched with their second choice: 3 -> 12
       * 2-> 13
       * 1 -> 14
       */

      if (acceptor.marriage_id === 4) {
        expect(suitor.marriage_id).toBe(11);
      } else if (acceptor.marriage_id === 3) {
        expect(suitor.marriage_id).toBe(12);
      } else if (acceptor.marriage_id === 2) {
        expect(suitor.marriage_id).toBe(13);
      } else if (acceptor.marriage_id === 1) {
        expect(suitor.marriage_id).toBe(14);
      }
    });
  });
});
