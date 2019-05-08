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
