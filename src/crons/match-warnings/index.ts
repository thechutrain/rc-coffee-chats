import moment from 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import * as types from '../../types';
import { initDB } from '../../db';
import { UserRecord } from '../../db/dbTypes';
import { templateMessageSender } from '../../zulip-messenger/msg-sender';

export function sendNextDayMatchWarning() {
  const usersToWarn: UserRecord[] = (() => {
    const db = initDB();
    const today = moment()
      .tz('America/New_York')
      .day();

    return db.User.findUsersNextDayMatchWarning(today);
  })();

  console.log('Users to warn:');
  console.log(usersToWarn);

  // NOTE: templateMessageSender will check NODE_ENV to send messages for real or not
  usersToWarn.forEach(user => {
    templateMessageSender(user.email, types.msgTemplate.WARNING_NOTIFICATION);
  });
}
