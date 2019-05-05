import * as dotenv from 'dotenv-safe';
dotenv.config();

import * as types from '../../types';
import { isToday } from '../../utils/dates';
import { getUsersAtRc } from '../../recurse-api';
import { templateMessageSender } from '../../zulip-messenger/msg-sender';
import { notifyAdmin } from '../../zulip-messenger';

export async function handlePossibleOnBoarding() {
  const usersToOnBoard = await getUsersToOnBoard();
  const usersToOnBoardEmail = usersToOnBoard.map(user => user.email);

  if (!usersToOnBoard.length) {
    // Case: no users to on board
    return;
  }

  console.log('onboarding ', usersToOnBoard.length, 'users on', new Date());

  // Notify Users about Chat Bot
  usersToOnBoard.forEach(({ email }) => {
    templateMessageSender(email, types.msgTemplate.ONBOARDING);
  });

  // Notify Admin that num of users messaged
  const adminMessage = `${
    process.env.NODE_ENV === 'production'
      ? 'PROD: onboarding'
      : 'DEV: Would onboard'
  } ${usersToOnBoard.length} number of users. They include: ${JSON.stringify(
    usersToOnBoardEmail
  )}`;
  notifyAdmin(adminMessage, 'LOG');
}

export const getUsersToOnBoard = () =>
  getUsersAtRc().then(users =>
    users.filter(user =>
      user.stints.some(
        stint => stint.type === 'retreat' && isToday(stint.start_date)
      )
    )
  );
