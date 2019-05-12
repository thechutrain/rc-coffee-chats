import { matchPair } from '../../db/models/user_model';

// TODO: write tests!!
export function isRepeatMatch(match: matchPair): boolean {
  const userA = match[0];
  const userB = match[1];
  for (const prevMatch of userA.prevMatches) {
    if (prevMatch.id === userB.id) {
      return true;
    }
  }
  return false;
}
