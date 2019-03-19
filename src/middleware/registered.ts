/**
 * Checks if a given user is registered in the database &
 * prompts user to signup if not registered
 */

// type msgSender = (email: string, options: {}) => void;
import { msgType } from '../zulip_coms/msgSender';

export function initCheckRegistered(db, msgSender) {
  return function isRegistered(req, res, next) {
    const senderEmail = req.body.message.sender_email;
    const user = db.user.find(senderEmail);

    // CASE: already registered user --> proceed
    if (user) {
      console.log(`Found a registered user: ${user.email}`);
      console.log(req.local);
      req.local = {};
      console.log(req.local);
      // req.local.user = user.email;
      next();
      return;
    }

    // CASE: not a registered user
    const wantsToSignUp = req.body.data.match(/signup/gi);

    if (wantsToSignUp) {
      const sqlResult = db.user.add({
        email: senderEmail,
        full_name: req.body.message.sender_full_name
      });
      // TODO: check if sql result was successful or not
      // right now assuming that is was successful
      msgSender(senderEmail, msgType.SIGNED_UP);
    } else {
      msgSender(senderEmail, msgType.PROMPT_SIGNUP);
    }

    res.json({});
  };
}
