import { marriage_id, Acceptor, Suitor } from '../marriage-types';
import { makeStableMarriageMatches } from '../stable-marriage-algo';
import { makeSuitorPool, makeAcceptorPool } from '../helper-fn-marriage';
import cloneDeep from 'lodash/cloneDeep';
import { men, women, IMarriagePerson } from './mock_data/set_1_data';

describe('Stable Marriage Match Algo!!', () => {
  it('should throw an error if suitors and acceptors are different sizes', () => {
    const pool_men = cloneDeep(men);
    const pool_women = cloneDeep(women);
    pool_women.splice(1, 1);
    expect(pool_men.length).not.toEqual(pool_women.length);
    const defaultFindPriorities = (a: any, b: any[]) => b;

    const suitorPool = makeSuitorPool<IMarriagePerson<string>>(
      pool_men,
      'data',
      defaultFindPriorities,
      pool_women
    );

    const acceptorPool = makeAcceptorPool<IMarriagePerson<string>>(
      pool_women,
      'data',
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

  it('should find stable match in a pool of four users', () => {
    console.log('🐝');
  });
});
