import { makeSuitorPool, makeAcceptorPool } from '../helper-fn-marriage';

/**
 * Test:
 *  - make suitorPool
 *  - make acceptorPool
 *  - TODO: more robust test, where there has to be a unique marriage_id?
 */

describe('Make suitor pool', () => {
  it('should be able to make a pool of suitors', () => {
    interface IPerson {
      name: string;
    }
    const m_1 = { name: 'm_1' };
    const m_2 = { name: 'm_2' };
    const w_1 = { name: 'w_1' };
    const w_2 = { name: 'w_2' };
    const w_3 = { name: 'w_3' };
    const male_pool = [m_1, m_2];
    const female_pool = [w_1, w_2, w_3];
    const basicPriority = (a: any, b: any[]) => b;

    const suitorMap = makeSuitorPool<IPerson>(
      male_pool,
      'name',
      basicPriority,
      female_pool
    );

    // ==== test the suitor map ===
    expect(suitorMap.size).toBe(male_pool.length);
    suitorMap.forEach((suitor, m_id) => {
      expect(suitor.priority.length).toBe(female_pool.length);
      expect(suitor).toHaveProperty('marriage_id');
      expect(suitor).toHaveProperty('data');
      expect(suitor).toHaveProperty('currentlyAccepted', false);
    });
  });

  it('should be able to make a pool of suitors from custom findPriorities fn', () => {
    interface IPerson {
      name: string;
    }
    const m_1 = { name: 'm_1' };
    const m_2 = { name: 'm_2' };
    const w_1 = { name: 'w_1' };
    const w_2 = { name: 'w_2' };
    const w_3 = { name: 'w_3' };
    const male_pool = [m_1, m_2];
    const female_pool = [w_1, w_2, w_3];
    const reversePriority = (a: IPerson, b: IPerson[]) => {
      b.reverse();
    };
  });

  it('should be able to make a pool of acceptors', () => {
    interface IPerson {
      name: string;
    }
    const m_1 = { name: 'm_1' };
    const m_2 = { name: 'm_2' };
    const w_1 = { name: 'w_1' };
    const w_2 = { name: 'w_2' };

    const male_pool = [m_1, m_2];
    const female_pool = [w_1, w_2];
    const basicPriority = (a: any, b: any[]) => b;

    const acceptorPool = makeAcceptorPool<IPerson>(
      male_pool,
      'name',
      basicPriority,
      female_pool
    );

    // ==== test the suitor map ===
    expect(acceptorPool.size).toBe(female_pool.length);
    acceptorPool.forEach((acceptor, m_id) => {
      expect(acceptor.priority.length).toBe(female_pool.length);
      expect(acceptor).toHaveProperty('marriage_id');
      expect(acceptor).toHaveProperty('data');
      expect(acceptor).toHaveProperty('topSuitor', null);
    });
  });

  xit('should be able to make a pool of acceptors from custom findPriorities fn', () => {});
});
