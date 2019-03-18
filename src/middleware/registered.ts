/**
 * Checks if a given user is registered in the database &
 * prompts user to signup if not registered
 */

import { MsgStatus, messageTypeEnum } from '../zulip_coms/msgSender';

export function initCheckRegistered(db, msgSender) {
  return function isRegistered(req, res, next) {
    const senderEmail = req.body.message.sender_email;
    const userExists = db.user.find(senderEmail);

    if (userExists) {
      next();
      return;
    }

    const wantsToSignUp = req.body.data.match(/signup/gi);

    if (wantsToSignUp) {
      const sqlResult = db.user.add({
        email: senderEmail,
        full_name: req.body.message.sender_full_name
      });

      msgSender(senderEmail, {
        status: sqlResult.status === 'OK' ? MsgStatus.OK : MsgStatus.ERROR,
        messageType: messageTypeEnum.SIGNUP
      });
    } else {
      msgSender(senderEmail, {
        status: MsgStatus.OK,
        messageType: messageTypeEnum.PROMPT_SIGNUP
      });
    }

    res.json({});
  };
}
