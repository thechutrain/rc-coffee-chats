/** ==== Middleware fn that checks registration ====
 * Checks if a given user is registered in the database &
 * prompts user to signup if not registered
 */

/** TODO:
 * 1) simplify: either user exists or doesn't
 * case: user exists --> req.local.user && call next
 * case: user does not exist --> req.local.user with flag of not registered && call next
 *
 */

import * as types from '../types';

// TODO: make a generic interface for this msg sender!
// seperate the concerns so it can handle three events: onSuccessfulSignup, onFailedSignup, promptSignup

export function initRegisteredHandler(db, msgSender) {
  return (req, res, next) => {
    const senderEmail = req.body.message.sender_email;
    const user = db.user.find(senderEmail);

    req.local.user = {
      email: senderEmail,
      isRegistered: !!user
    };
    console.log(req.local.user);
    console.log('===== END registeredMiddleware =====');
    next();
    return;

    // CASE: already registered user --> proceed
    if (user) {
      req.local.user = {
        email: senderEmail,
        isRegistered: true
      };
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
      // TODO: decouple this message sender or make it more generic
      msgSender(senderEmail, types.okMsg.SIGNED_UP);
    } else {
      msgSender(senderEmail, types.okMsg.PROMPT_SIGNUP);
    }

    res.json({});
  };
}
