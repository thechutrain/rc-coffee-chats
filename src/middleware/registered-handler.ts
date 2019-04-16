/** ==== Middleware fn that checks if user is registered ====
 * Checks if a given user is registered in the database &
 */

/** TODO:
 * 1) simplify: either user exists or doesn't
 * case: user exists --> req.local.user && call next
 * case: user does not exist --> req.local.user with flag of not registered && call next
 *
 */

import * as types from '../types';
import { myDB } from '../db/dbTypes';

// TODO: make a generic interface for this msg sender!
// seperate the concerns so it can handle three events: onSuccessfulSignup, onFailedSignup, promptSignup

export function initRegisteredHandler(db: myDB) {
  return (req: types.IZulipRequest, _, next) => {
    const senderEmail = req.body.message.sender_email;
    const isRegistered = db.User.emailExists(senderEmail);

    // TEMP: patches missing full_name column for users
    if (isRegistered) {
      try {
        console.log('updating ...');
        console.log(req.body.message.sender_full_name);
        db.User.update(
          { full_name: req.body.message.sender_full_name },
          { email: senderEmail }
        );
      } catch (e) {
        console.log(
          `Error trying to update User's full_name: ${JSON.stringify(req.body)}`
        );
        req.local.errors = [{ errorType: types.Errors.FAILED_UPDATE }];
      }
    }

    req.local.user = {
      email: senderEmail,
      isRegistered
    };

    next();
    return;
  };
}
