import { sendGenericMessage } from '../../zulip-messenger';
import { matchPair } from '../../db/models/user_model';

// TODO: need to test this!
export function notifyMatchPair(match: matchPair) {
  const emailList = match.map(userRecord => userRecord.email);
  // const userNames = match.map(userRecord => userRecord.full_name.split(' ')[0]);
  const nameLinks = match.map(userRecord => {
    const firstName = userRecord.full_name.split(' ')[0];
    return `[${firstName}](https://www.recurse.com/directory?q=${encodeURIComponent(
      userRecord.email
    )})`;
  });

  // TODO: add links to the names of the users here
  const msgContent = `☀️ Good morning ${nameLinks.join(
    ' and '
  )}! \nThe two of you have been paired for a chat today. Hope you get a chance to chat over coffee or tea or anything that you fancy -- enjoy!`;

  sendGenericMessage(emailList, msgContent);
}
