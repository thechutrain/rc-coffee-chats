import { marriage_id as m_id, Acceptor, Suitor } from './marriage-types';

/** TODO: make a "makeSuitor" fn and "makeAcceptor" fn specific to User
 *
 */

export function makeSuitorPool<P>(
  people: P[],
  marriageKey: keyof P
): Map<m_id, Suitor<P>> {
  const suitorMap: Map<m_id, Suitor<P>> = new Map();

  people.forEach(person => {
    const marriage_id = person[marriageKey];

    const suitor = {
      data: person,
      marriage_id,
      priority: [],
      currentlyAccepted: false
    };

    if (suitorMap.has(marriage_id)) {
      throw new Error(`Duplicate marriage id! ${marriage_id}`);
    }

    suitorMap.set(marriage_id, suitor);
  });

  return suitorMap;
}

// export function makeAcceptorPool<T>(
//   people: any[]
// ): Array<Acceptor<T>> {
//   return [];
// }
