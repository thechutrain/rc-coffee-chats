/**
 * NOTE: This stable marriage algorithm should be generalized
 * so it should not have to depend on the shape of the UserRecord
 */

interface IUnique {
  _id: number;
}
export type Acceptor<T extends IUnique> = {
  self: T;
  topSuitor: T;
  priority: T[];
};

export type Suitor<T extends IUnique> = {
  self: T;
  priority: T[];
  currentlyAccepted: boolean;
};

export function trimAfterRank<T>(priorityList: T[], rank: number): T[] {
  priorityList.splice(rank + 1, priorityList.length - (rank + 1));

  return priorityList;
}

export function makeStableMarriageMatches<T extends IUnique>(
  suitors: Map<string, Suitor<T>>,
  acceptors: Map<string, Acceptor<T>>
): Array<[T, T]> {
  if (suitors.size !== acceptors.size) {
    throw new Error('suitors and acceptor arrays not equal length');
  }

  const acceptedAcceptors = [];
  while (acceptedAcceptors.length !== acceptors.size) {
    for (const s of suitors.values()) {
      if (!s.currentlyAccepted && s.priority.length !== 0) {
        const potentialAcceptor = acceptors.get(s.priority[0].email);
        const rank = potentialAcceptor.priority.indexOf(s.self);
        // case 1: no current proposals --> accept
        if (!potentialAcceptor.topSuitor) {
          potentialAcceptor.topSuitor = s.self;
          acceptedAcceptors.push(potentialAcceptor);
          trimAfterRank(potentialAcceptor.priority, rank);
          s.currentlyAccepted = true;
        } else {
          const currentTopSuitorRank = potentialAcceptor.priority.indexOf(
            potentialAcceptor.topSuitor
          );
          // case 2: has proposal, but this suitor is worse or not in priority list --> so keep current proposal
          if (currentTopSuitorRank < rank || rank === -1) {
            s.priority.shift();
          } else {
            // case 3: has proposal, but this suitor is better --> set current proposal to this suitor, & get reference to previous suitor & set currentAccepted
            const rejectedSuitor = suitors.get(
              potentialAcceptor.topSuitor.email
            );
            rejectedSuitor.currentlyAccepted = false;

            potentialAcceptor.topSuitor = s.self;
            trimAfterRank(potentialAcceptor.priority, rank);
            s.currentlyAccepted = true;
          }
        }
      }
    }
  }

  // make matches from acceptors accepted suitors
  const matches: Array<[IUser, IUser]> = acceptedAcceptors.map(makeMatch);
  //   const matches = acceptedAcceptors.map((a: Acceptor) => {
  //     return [a.self, a.topSuitor];
  //   });

  return matches;
}

function makeMatch(a: Acceptor): [IUser, IUser] {
  return [a.self, a.topSuitor];
}
