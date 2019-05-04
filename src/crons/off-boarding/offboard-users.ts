// TEMP: for testing
import * as dotenv from 'dotenv-safe';
dotenv.config();
import { initDB } from '../../db';
const db = initDB();

import * as types from '../../types';
import { getUsersFromBatch } from '../../recurse-api/api-calls';
import { templateMessageSender } from '../../zulip-messenger/msg-sender';
import { notifyAdmin } from '../../zulip-messenger/notify-admin';

type email = string;

// TESTING!
(async () => {
  // const usersToOffBoard = await getUsersToOffBoard(60);
  // console.log(usersToOffBoard);
  // TEMP:
  // NOTE: need to pass true to run for real
  // offBoardUsers(usersToOffBoard, false);
})();

// export function get

/**
 *
 * @param usersToOffBoard
 * @param runForReal
 */
// ✅ Working
export function offBoardUsers(usersToOffBoard: email[]) {
  const error: email[] = [];
  const success: email[] = [];
  const runForReal = process.env.NODE_ENV === 'production';

  for (const userEmail of usersToOffBoard) {
    try {
      if (runForReal) {
        db.User.update({ is_active: 0 }, { email: userEmail });
      }
      success.push(userEmail);
    } catch (e) {
      error.push(userEmail);
    }
  }

  return { error, success };
}

export function notifyAdminOffboardingResults(err, deactivated) {
  notifyAdmin(
    `Off boarded the following users: ${JSON.stringify(deactivated)}`,
    'LOG'
  );

  if (err.length) {
    notifyAdmin(
      `ERROR off boarding the following users: ${JSON.stringify(err)}`,
      'WARNING'
    );
  }
}

export function notifyDeactivatedUsers(deactivated: email[]) {
  deactivated.forEach(userEmail => {
    templateMessageSender(userEmail, types.msgTemplate.OFFBOARDING);
  });
}
