/** function used for deactivating users, notifying them, updating maintainers that
 *
 */
// TEMP: for testing
import * as dotenv from 'dotenv-safe';
dotenv.config();
import { initDB } from '../db';
const db = initDB();

import * as types from '../types';
import { getUsersFromBatch } from '../recurse-api/api-calls';
import { templateMessageSender } from '../zulip-messenger/msg-sender';
import { notifyAdmin } from '../zulip-messenger/notify-admin';

type email = string;

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

/**
 *  NOTE: not all Users are here for the full batch!
 *  - need to address the fact some batches (mini) end_date: true.
 *  - half batchers need to get notified 6 weeks earlier than the   end_date
 * TODO:
 * - find all users in the given batch
 * - find all active users who are in the current batch
 */
export async function getUsersToOffBoard(batchId: number) {
  const batchMembers = await getUsersFromBatch(batchId);
  const activeChatUserEmails = db.User.findActiveUsers().map(
    user => user.email
  );

  return activeChatUserEmails.filter(activeEmail => {
    for (const batchMember of batchMembers) {
      // TODO: check if its in half batch or not
      if (activeEmail === batchMember.email) {
        return true;
      }
    }
    return false;
  });
}

// TESTING!
(async () => {
  const usersToOffBoard = await getUsersToOffBoard(60);
  console.log(usersToOffBoard);
  // TEMP:
  // NOTE: need to pass true to run for real
  offBoardUsers(usersToOffBoard, false);
})();
