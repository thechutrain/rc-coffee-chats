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

/**
 *
 * @param usersToOffBoard
 * @param runForReal
 */
// ✅ Working
export async function offBoardUsers(
  usersToOffBoard: email[],
  runForReal = false
) {
  const succDeactivations: email[] = [];
  const errDeactivations: email[] = [];

  for (const userEmail of usersToOffBoard) {
    // Deactivate Users:
    try {
      if (runForReal) {
        db.User.update({ is_active: 0 }, { email: userEmail });
        // Notify Users their account is frozen
        templateMessageSender(userEmail, types.msgTemplate.OFFBOARDING);
      }
      succDeactivations.push(userEmail);
    } catch (e) {
      errDeactivations.push(userEmail);
    }
  }

  // Log info to admin:
  notifyAdmin(
    `Off boarded the following users: ${JSON.stringify(succDeactivations)}`,
    'LOG'
  );

  if (errDeactivations.length) {
    notifyAdmin(
      `ERROR off boarding the following users: ${JSON.stringify(
        errDeactivations
      )}`,
      'WARNING'
    );
  }
}
