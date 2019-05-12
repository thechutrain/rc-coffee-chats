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
  const { errors } = req.local;

  // Case: handle errors with no user (invalid zulip token)
  if (!req.local.user && errors.length) {
    console.log('Errors!');
    console.warn(errors);
    return next();
  }

  // TEMP: do not respond to any group messages:
  if (req.body.message.display_recipient.length !== 2) {
    return next();
  }

  // Case: handle error messages
  // NOTE: originUser may not be there if bad token
  const originUser = req.local.user.email;
  if (req.local.user && errors.length) {
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
  console.log(sendTo);

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
