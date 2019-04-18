import moment from 'moment';
import 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from '../../db';
import { UserRecord } from '../../db/dbTypes';

const usersToWarn: UserRecord[] = (() => {
  const db = initDB();
  const today = moment()
    .tz('America/New_York')
    .day();

  return db.User.findUsersNextDayMatchWarning(today);
})();

console.log(usersToWarn);
