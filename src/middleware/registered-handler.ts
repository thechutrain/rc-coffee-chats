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
  return (req, _, next) => {
    const senderEmail = req.body.message.sender_email;
    let userExists = false;
    try {
      // TODO: create a sql fn for checking if the user exists or not
      // instead of throwing an error!
      db.User.findByEmail(senderEmail);
      userExists = true;
    } catch (e) {
      // user does not exist
    }

    req.local.user = {
      email: senderEmail,
      isRegistered: userExists
    };

    next();
    return;
  };
}
