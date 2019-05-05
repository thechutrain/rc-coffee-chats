import * as dotenv from 'dotenv-safe';
dotenv.config();

import {
  getUsersToOffBoard,
  deactivateUsers,
  notifyDeactivatedUsers
} from './offboardinghelpers';
import { notifyAdmin } from '../../zulip-messenger';

export async function handlePossibleOffBoarding() {
  const users = await getUsersToOffBoard();

  if (!users.length) {
    // Case: no users to off-board
    console.log('handlePossibleOffBoard(): no users to offboard');
    return;
  }

  const userEmails = users.map(user => user.email);
  offBoardUsers(userEmails);
}

export const offBoardUsers = (userEmails: string[]) => {
  console.log('offboarding ', userEmails.length, 'users on', new Date());

  const { deactivatedUsers, errorUsers } = deactivateUsers(userEmails);

  notifyDeactivatedUsers(deactivatedUsers);

  // Notify Admin users who were offboarded and users who could not be offboarded
  notifyAdmin(
    `${
      process.env.NODE_ENV === 'production'
        ? 'PROD: offboarded'
        : 'DEV: Would offboard'
    } the following users: ${JSON.stringify(deactivatedUsers)}`,
    'LOG'
  );

  if (errorUsers.length) {
    notifyAdmin(
      `ERROR off boarding the following users: ${JSON.stringify(errorUsers)}`,
      'WARNING'
    );
  }
};
