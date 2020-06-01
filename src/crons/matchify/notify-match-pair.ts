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

  const usersWithZoom = match.filter(user => user.zoom_url !== null);
  let zoomMessage;
  if (usersWithZoom.length === 0) {
    zoomMessage =
      'Neither of you has your personal Zoom URL set in [your RC settings](https://www.recurse.com/settings). For today, video chat whatever way works best for you, but please set your Zoom URLs for future matches!';
  } else {
    const zoomUser =
      usersWithZoom[Math.floor(Math.random() * usersWithZoom.length)];
    zoomMessage = `You can use ${
      zoomUser.full_name.split(' ')[0]
    }'s personal Zoom meeting to chat: ${zoomUser.zoom_url}`;
  }

  // TODO: add links to the names of the users here
  const msgContent =
    `Hello ${nameLinks.join(
      ' and '
    )}! \nYou have been paired for a chat!` +
    '\n\n' +
    zoomMessage;

  sendGenericMessage(emailList, msgContent);
}
