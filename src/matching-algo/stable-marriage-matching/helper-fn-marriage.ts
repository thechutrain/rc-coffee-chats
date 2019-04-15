import { marriage_id as m_id, Acceptor, Suitor } from './marriage-types';
import { shuffle, cloneDeep } from 'lodash';

// export function defaultFindPriorities<P>(
//   person: P,
//   oppositePool: P[],
//   key: keyof P
// ): Array<P[keyof P]> {
//   return oppositePool.map((matchPerson: P) => matchPerson[key]);
// }

export function makeUserPriorities<U>(user: U, oppositePool: U[]) {
  const oppositePoolClone = cloneDeep(oppositePool);
}

export function makeSuitorPool<P>(
  people: P[],
  marriageKey: keyof P,
  // findPriorities: (person: P, acceptorPool: P[]) => Array<P[keyof P]>,
  findPriorities: (person: P, acceptorPool: P[]) => P[],
  acceptorPool: P[]
): Map<m_id, Suitor<P>> {
  const suitorMap: Map<m_id, Suitor<P>> = new Map();

  people.forEach(person => {
    const marriage_id = person[marriageKey];

    const priority = findPriorities(person, acceptorPool).map(
      p => p[marriageKey]
    );

    const suitor = {
      data: person,
      marriage_id,
      priority,
      currentlyAccepted: false
    };

    if (suitorMap.has(marriage_id)) {
      throw new Error(`Duplicate marriage id! ${marriage_id}`);
    }

    suitorMap.set(marriage_id, suitor);
  });

  return suitorMap;
}

export function makeAcceptorPool<P>(
  people: P[],
  marriageKey: keyof P,
  // findPriorities: (person: P, suitorPool: P[]) => Array<P[keyof P]>,
  findPriorities: (person: P, suitorPool: P[]) => P[],
  suitorPool: P[]
): Map<m_id, Acceptor<P>> {
  const acceptorMap: Map<m_id, Acceptor<P>> = new Map();
  people.forEach(person => {
    const marriage_id = person[marriageKey];
    const priority = findPriorities(person, suitorPool).map(
      p => p[marriageKey]
    );

    const acceptor = {
      data: person,
      marriage_id,
      priority,
      topSuitor: null
    };

    if (acceptorMap.has(marriage_id)) {
      throw new Error(`Duplicate marriage id! ${marriage_id}`);
    }

    acceptorMap.set(marriage_id, acceptor);
  });

  return acceptorMap;
}
