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
    // Case: no users to offboard
    return;
  }

  console.log('offboarding ', users.length, 'users on', new Date());

  const { deactivatedUsers, errorUsers } = deactivateUsers(
    users.map(user => user.email)
  );

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
}
