/** ==== Middleware fn that checks if user is registered and is active ====
 * Checks if a given user is registered in the database &
 *
 */
import * as types from '../types';
import { myDB } from '../types/dbTypes';
import { IZulipRequestWithUser } from '../types/zulipRequestTypes';

export function initRegisteredHandler(db: myDB) {
  return (req: IZulipRequestWithUser, _, next) => {
    if (req.locals.errors && req.locals.errors.length) {
      next();
    }

    const senderEmail = req.body.message.sender_email;

    try {
      const user = db.User.findByEmail(senderEmail);

      req.locals.user = {
        email: user.email,
        isRegistered: true,
        isActive: user.is_active === 1,
        isAdmin: user.is_admin === 1,
        data: user
      };
    } catch (e) {
      // CASE: user does not exist in User table
      req.locals.user = {
        email: senderEmail,
        isRegistered: false,
        isActive: false,
        isAdmin: false
      };

      return next();
    }

    // TEMP: patches missing full_name column for users
    try {
      db.User.update(
        { full_name: req.body.message.sender_full_name },
        { email: senderEmail }
      );
    } catch (e) {
      const errMessage = `Error trying to update User's full_name: ${JSON.stringify(
        req.body
      )}`;
      console.warn(errMessage);

      req.locals.errors.push({
        errorType: 'DB_UPDATE_ERROR',
        customMessage: errMessage
      });
    }

    next();
  };
}
