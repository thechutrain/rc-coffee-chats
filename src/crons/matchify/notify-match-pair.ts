import { sendGenericMessage } from '../../zulip-messenger';
import { matchPair } from '../../db/models/user_model';

// TODO: need to test this!
export function notifyMatchPair(match: matchPair) {
  const emailList = match.map(userRecord => userRecord.email);
  const userNames = match.map(userRecord => userRecord.full_name.split(' ')[0]);

  // TODO: add links to the names of the users here
  const msgContent = `Good morning ${userNames.join(
    ' and '
  )}! \nYou've been paired for a chat today.`;

  sendGenericMessage(emailList, msgContent);
}
