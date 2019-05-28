import { UserRecord } from '../../db/dbTypes';
import * as types from '../../types';
// TODO: write tests

export function clearSkippers(
  db: types.myDB,
  weekday: types.WEEKDAY
): UserRecord[] {
  const usersWhoSkipped = db.User.usersToSkip(weekday);

  db.User.clearTodaysSkippers();

  return usersWhoSkipped;
}
