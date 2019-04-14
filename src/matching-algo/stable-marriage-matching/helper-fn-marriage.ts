import { marriage_id as m_id, Acceptor, Suitor } from './marriage-types';

/** TODO: make a "makeSuitor" fn and "makeAcceptor" fn specific to User
 *
 */

export function makeSuitorPool<P>(
  people: P[],
  marriageKey: keyof P,
  findPriorities: (person: P, acceptorPool: P[]) => Array<keyof P>,
  acceptorPool: P[]
): Map<m_id, Suitor<P>> {
  const suitorMap: Map<m_id, Suitor<P>> = new Map();

  people.forEach(person => {
    const marriage_id = person[marriageKey];

    const priority = findPriorities(person, acceptorPool);

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
  findPriorities: (person: P, suitorPool: P[]) => Array<keyof P>,
  suitorPool: P[]
): Map<m_id, Acceptor<P>> {
  const acceptorMap: Map<m_id, Acceptor<P>> = new Map();
  people.forEach(person => {
    const marriage_id = person[marriageKey];
    const priority = findPriorities(person, suitorPool);

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
