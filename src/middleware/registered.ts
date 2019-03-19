/**
 * Checks if a given user is registered in the database &
 * prompts user to signup if not registered
 */

import { MsgStatus, msgType } from '../zulip_coms/msgSender';

export function initCheckRegistered(db, msgSender) {
  return function isRegistered(req, res, next) {
    const senderEmail = req.body.message.sender_email;
    const user = db.user.find(senderEmail);

    if (user) {
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
        messageType: msgType.SIGNUP
      });
    } else {
      msgSender(senderEmail, {
        status: MsgStatus.OK,
        messageType: msgType.PROMPT_SIGNUP
      });
    }

    res.json({});
  };
}
