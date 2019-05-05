import { initDB } from '../../db';
import { matchPair } from '../../db/models/user_model';

export function recordMatches(matches: matchPair[]) {
  const db = initDB();
  const isProd = process.env.NODE_ENV === 'production';
  const matchPairIds = matches.map(match => [match[0].id, match[1].id]);
  if (isProd) {
    matchPairIds.forEach(db.UserMatch.add);
  } else {
    console.log(
      `Not in Production. Would have recorded the following ids as usermatches:`,
      matchPairIds
    );
  }
}
