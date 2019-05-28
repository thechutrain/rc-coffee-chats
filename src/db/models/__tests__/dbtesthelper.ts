import { Client } from 'pg';
import { User } from '../user';
import { UserMatch } from '../usermatch';
import { Match } from '../match';

export async function testSetUp(db: Client): Promise<void> {
  await new User(db).initTable();
  await new UserMatch(db).initTable();
  await new Match(db).initTable();
  return;
}

export async function seedUserData(user: User, userSeedData) {
  for (const userData of userSeedData) {
    await user.add(userData.email, 'full_name_here');
    if (userData.skipNext) {
      user.updateSkip(userData.email, true);
    }
    if (userData.active === false) {
      user.updateActive(userData.email, false);
    }
    if (userData.days) {
      user.updateDays(userData.email, userData.days);
    }
  }
}
