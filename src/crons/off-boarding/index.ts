import * as dotenv from 'dotenv-safe';
dotenv.config();

import { isToday } from '../../utils/dates';
import { getUsersAtRc } from '../../recurse-api';
import {
  offBoardUsers,
  notifyAdminOffboardingResults,
  notifyDeactivatedUsers
} from '../../crons/off-boarding/offboard-users';

export async function handlePossibleOffboarding() {
  const users = await getUsersToOffBoard();

  if (!users.length) {
    return;
  }

  console.log('offboarding ', users.length, 'users on', new Date());

  const { error, success } = offBoardUsers(users.map(user => user.email));

  notifyAdminOffboardingResults(error, success);
  notifyDeactivatedUsers(success);
}

export const getUsersToOffBoard = async () =>
  getUsersAtRc().then(users =>
    users.filter(user =>
      // NOTE: faculty members have stints with end_date = null.
      user.stints.some(
        stint =>
          !!stint.end_date &&
          stint.type === 'retreat' &&
          isToday(stint.end_date)
      )
    )
  );
