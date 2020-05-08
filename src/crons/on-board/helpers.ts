import * as types from '../../types';
import { templateMessageSender } from '../../zulip-messenger/msg-sender';
import { notifyAdmin } from '../../zulip-messenger';
import { isToday } from '../../utils/dates';
import { getUsersAtRc } from '../../recurse-api';

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

// TODO: test this fn
export async function onBoardUsers(userEmails: string[]) {
  console.log('onboarding ', userEmails.length, 'users on', new Date());

  // Notify Users about Chat Bot
  for (let email of userEmails) {
    await sleep(500);
    templateMessageSender(email, types.msgTemplate.ONBOARDING);
  }

  // Notify Admin that num of users messaged
  const adminMessage = `${
    process.env.NODE_ENV === 'production'
      ? 'PROD: onboarding'
      : 'DEV: Would onboard'
  } ${userEmails.length} number of users. They include: ${JSON.stringify(
    userEmails
  )}`;
  notifyAdmin(adminMessage, 'LOG');
}

export function getUsersToOnBoard() {
  return getUsersAtRc().then(users =>
    users.filter(user =>
      user.stints.some(
        stint => stint.type === 'retreat' && isToday(stint.start_date)
      )
    )
  );
}
