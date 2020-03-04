import { sendGenericMessage } from '../../zulip-messenger';
import { matchPair } from '../../db/models/user_model';

export function notifyMatchPair(match: matchPair) {
  let [emailList, msgContent] = buildNotifications(match);
  sendGenericMessage(emailList, msgContent);
}

//Exported in order to test
export function buildNotifications(match: matchPair): [string[], string] {
  const emailList = match.map(userRecord => userRecord.email);
  const nameLinks = match.map(userRecord => {
    const firstName = userRecord.full_name.split(' ')[0];
    return `[${firstName}](https://www.recurse.com/directory?q=${encodeURIComponent(
      userRecord.email
    )})`;
  });

  let match2 = "The two of you have been paired for a chat today.";
  let match3 = "✨ You've been blessed with a rare three person chat today! ✨";
  const msgContent = `☀️ Good morning ${nameLinks.join(
    ' and '
  )}! \n${match.length == 2 ? match2 : match3} Hope you get a chance to chat over coffee or tea or anything that you fancy -- enjoy!`;

  return [emailList, msgContent];
}
