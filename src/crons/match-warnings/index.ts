import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from '../../db';
import { UserRecord } from '../../db/dbTypes';

const usersToWarn: UserRecord[] = (() => {
  const db = initDB();
  const today = new Date().getDay();
  // const today = 2;

  return db.User.findUsersNextDayMatchWarning(today);
})();

// console.log(usersToWarn);
