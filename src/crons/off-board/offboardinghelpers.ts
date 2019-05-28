import { initDB } from '../../db';
const db = initDB();

import * as types from '../../types';
import { isToday } from '../../utils/dates';
import { getUsersAtRc } from '../../recurse-api';
import { templateMessageSender } from '../../zulip-messenger/msg-sender';

type email = string;

export const getUsersToOffBoard = () =>
  getUsersAtRc().then(users =>
    users.filter(user =>
      // NOTE: faculty members have stints with end_date = null.
      // stint.type = 'retreat' or employement? (employment for facilitators)
      user.stints.some(stint => !!stint.end_date && isToday(stint.end_date))
    )
  );

// ✅ Working
export function deactivateUsers(
  usersToOffBoard: email[]
): {
  deactivatedUsers: email[];
  errorUsers: email[];
} {
  const runForReal = process.env.NODE_ENV === 'production';
  const deactivatedUsers: email[] = [];
  const errorUsers: email[] = [];

  for (const userEmail of usersToOffBoard) {
    try {
      if (runForReal) {
        db.User.update({ is_active: 0 }, { email: userEmail });
      }
      deactivatedUsers.push(userEmail);
    } catch (e) {
      errorUsers.push(userEmail);
    }
  }

  return { deactivatedUsers, errorUsers };
}

export function notifyDeactivatedUsers(deactivated: email[]) {
  deactivated.forEach(userEmail => {
    templateMessageSender(userEmail, types.msgTemplate.OFFBOARDING);
  });
}
