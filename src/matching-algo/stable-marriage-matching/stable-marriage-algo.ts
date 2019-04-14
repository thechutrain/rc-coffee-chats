/**
 * NOTE: This stable marriage algorithm should be generalized
 * so it should not have to depend on the shape of the UserRecord
 */
import { marriage_id, IUnique, Acceptor, Suitor } from './marriage-types';

export function trimAfterRank<T>(priorityList: T[], rank: number): T[] {
  priorityList.splice(rank + 1, priorityList.length - (rank + 1));

  return priorityList;
}

export function makeStableMarriageMatches<T extends IUnique>(
  suitors: Map<marriage_id, Suitor<T>>,
  acceptors: Map<marriage_id, Acceptor<T>>
): Array<[Acceptor<T>, Suitor<T>]> {
  if (suitors.size !== acceptors.size) {
    throw new Error('suitors and acceptor arrays not equal length');
  }

  const acceptedAcceptors: Array<Acceptor<T>> = [];
  while (acceptedAcceptors.length !== acceptors.size) {
    for (const s of suitors.values()) {
      if (!s.currentlyAccepted && s.priority.length !== 0) {
        const potentialAcceptor = acceptors.get(s.priority[0]);
        const rank = potentialAcceptor.priority.indexOf(s.marriage_id);
        // case 1: no current proposals --> accept
        if (!potentialAcceptor.topSuitor) {
          potentialAcceptor.topSuitor = s.marriage_id;
          acceptedAcceptors.push(potentialAcceptor);
          trimAfterRank(potentialAcceptor.priority, rank);
          s.currentlyAccepted = true;
        } else {
          const currentTopSuitorRank = potentialAcceptor.priority.indexOf(
            potentialAcceptor.topSuitor
          );
          // case 2: has proposal, but this current suitor is worse or not in priority list --> so keep current proposal
          if (currentTopSuitorRank < rank || rank === -1) {
            s.priority.shift();
          } else {
            // case 3: has proposal, but this suitor is better --> set current proposal to this suitor, & get reference to previous suitor & set currentAccepted
            const rejectedSuitor = suitors.get(potentialAcceptor.topSuitor);
            rejectedSuitor.currentlyAccepted = false;

            potentialAcceptor.topSuitor = s.marriage_id;
            trimAfterRank(potentialAcceptor.priority, rank);
            s.currentlyAccepted = true;
          }
        }
      } else {
        // CASE: suitor has no priority, pair with random acceptor?
        // or throw an error? b/c suitor should have a priority for all the acceptors?
        throw new Error('Suitor missing their priority');
      }
    }
  }

  // make matches from acceptors accepted suitors
  const matches: Array<[Acceptor<T>, Suitor<T>]> = acceptedAcceptors.map(
    acceptor => {
      const suitorMatch = suitors.get(acceptor.topSuitor);
      return [acceptor, suitorMatch];
    }
  );

  return matches;
}
