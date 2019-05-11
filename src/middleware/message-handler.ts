/** ==== middleware for managing the sending of messages
 * checks req.local.msgInfo & sends message accordingly
 *
 */
import {
  sendGenericMessage,
  templateMessageSender
} from '../zulip-messenger/msg-sender';
import * as types from '../types';

export async function messageHandler(req: types.IZulipRequest, res, next) {
  const originUser = req.local.user.email;
  // const { targetUser } = req.local.action;
  const { errors } = req.local;
  console.log(errors);

  // Case: handle error messages
  // NOTE: originUser may not be there if bad token
  if (originUser && errors.length) {
    errors.forEach(async err => {
      const messageContent = err.customMessage
        ? `${err.customMessage}`
        : `Error: unspecified error ... ooops!`;
      try {
        await sendGenericMessage(originUser, messageContent);
      } catch (e) {
        console.warn(`Error trying to sendGenericMessage: ${e}`);
      }
    });

    next();
    return;
  }

  // Case: given a msgType
  const { msgTemplate, sendTo, msgArgs } = req.local.msgInfo;

  try {
    if (msgTemplate in types.msgTemplate) {
      await templateMessageSender(sendTo, msgTemplate, msgArgs);
    } else {
      const msg = JSON.stringify(req.local.msgInfo);
      await sendGenericMessage(originUser, `Req.local.msgInfo: ${msg}`);
    }
  } catch (e) {
    console.warn(`Error trying to send a message!!!!`, req.local.msgInfo);
  }
  next();
}
