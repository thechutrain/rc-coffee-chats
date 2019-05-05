import { UserRecord } from '../../db/dbTypes';

// TODO: write tests
// const usersWhoSkipped = db.User.findUsersWhoAreSkipping();
export function clearSkippers(db): UserRecord[] {
  const usersWhoSkipped = []; // TODO: make this query!

  db.User.clearTodaysSkippers();

  return [];
}
