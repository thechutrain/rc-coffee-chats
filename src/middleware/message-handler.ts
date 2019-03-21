/** ==== middleware for managing the sending of messages
 * checks req.local.msgInfo & sends message accordingly
 *
 */
import {
  sendGenericMessage,
  templateMessageSender
} from '../zulip-messenger/msg-sender';
import * as types from '../types';

export function messageHandler(req: types.IZulipRequest, res, next) {
  console.log(`======== send message handler ===========`);
  console.log(req.local.msgInfo);
  console.log(`\n`);

  const { currentUser, targetUser } = req.local.action;
  const { errors } = req.local;

  // Case: handle error messages
  if (errors.length) {
    errors.forEach(err => {
      const messageContent = err.customMessage
        ? `ERROR: ${err.customMessage}`
        : `unspecified error ... ooops!`;
      try {
        sendGenericMessage(currentUser, messageContent);
      } catch (e) {
        console.warn(`Error trying to sendGenericMEssage: ${e}`);
      }
    });
    next();
    return;
  }

  // Case: given a msgType
  const { msgTemplate, sendTo, msgArgs } = req.local.msgInfo;
  console.log(msgTemplate);
  console.log('===== template above =====');
  if (msgTemplate in types.msgTemplate) {
    templateMessageSender(sendTo, msgTemplate, msgArgs);
  } else {
    const msg = JSON.stringify(req.local.msgInfo);
    sendGenericMessage(currentUser, `Req.local.msgInfo: ${msg}`);
  }
  next();
}
