import moment from 'moment';
import 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from '../../db';
import { UserRecord } from '../../db/dbTypes';
import { sendGenericMessage } from '../../zulip-messenger/msg-sender';

function sendNextDayMatchWarning(sendMessage = true) {
  const usersToWarn: UserRecord[] = (() => {
    const db = initDB();
    const today = moment()
      .tz('America/New_York')
      .day();

    return db.User.findUsersNextDayMatchWarning(today);
  })();

  console.log('Users to warn:');
  console.log(usersToWarn);

  const warningMessage = `Hi there 👋\nJust a friendly reminder that you'll be matched tomorrow for coffee chats
  If you can't meet tomorrow and would like to cancel tomorrow's match, just type: \`\`\`UPDATE SKIP 0\`\`\`
  If you would no longer wish to receive these warnings messages, just type: \`\`\`UPDATE WARNINGS 0\`\`\`
  `;

  if (sendMessage) {
    usersToWarn.forEach(user => {
      sendGenericMessage(user.email, warningMessage);
    });
  }
}

sendNextDayMatchWarning();
