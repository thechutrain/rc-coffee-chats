/** ==== middleware for managing the sending of messages
 * checks req.local.msgInfo & sends message accordingly
 *
 */
import { sendGenericMessage } from '../zulip-messenger/msg-sender';
import * as types from '../types';

export function messageHandler(req: types.IZulipRequest, res, next) {
  console.log(`======== send message handler ===========`);
  const { currentUser, targetUser } = req.local.action;
  const { errors } = req.local;

  // Case: handle error messages
  if (errors.length) {
    errors.forEach(err => {
      const messageContent = err.customMessage
        ? `ERROR: ${err.customMessage}`
        : `Error`;
      console.log('there was an error, sending error message ....');
      try {
        sendGenericMessage(currentUser, messageContent);
      } catch (e) {
        console.warn(`Error trying to sendGenericMEssage: ${e}`);
      }
    });
    // next();
    res.json({});
    return;
  }

  // Case: given a msgType
  // TEMP:
  const msg = JSON.stringify(req.local.msgInfo);
  sendGenericMessage(currentUser, `Req.local.msgInfo: ${msg}`);
  next();
}
