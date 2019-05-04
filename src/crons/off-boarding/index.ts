import * as dotenv from 'dotenv-safe';
dotenv.config();

import { isToday } from '../../utils/dates';
import { getAllUsers } from '../../recurse-api';
import {
  offBoardUsers,
  notifyAdminOffboardingResults,
  notifyDeactivatedUsers
} from './offboard-users';

export const getUsersToOffBoard = async () =>
  getAllUsers({ scope: 'current' }).then(users =>
    users.filter(user =>
      // NOTE: faculty members have stints with end_date = null.
      user.stints.some(stint => !!stint.end_date && isToday(stint.end_date))
    )
  );

/** check each base to determine if it should offboard users who are leaving
 *
 * @param batches
 */
export async function handlePossibleOffboarding() {
  const users = await getUsersToOffBoard();

  if (!users.length) {
    return;
  }

  console.log('offboarding ', users.length, 'users on', new Date());

  const { error, success } = offBoardUsers(users.map(user => user.email));
  console.log('success', success);
  console.error('error', error);

  notifyAdminOffboardingResults(error, success);
  notifyDeactivatedUsers(success);
}

handlePossibleOffboarding();
