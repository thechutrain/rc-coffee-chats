/** NOTE: not a cron job, but a script that will notify users of message:
 *
 */
import { initDB } from '../../db';

export function sendUserNotification(message: string) {
  const db = initDB();
  const activeUsers = db.User.findActiveUsers();

  activeUsers.forEach(user => {
    sendGenericMessage(user.email, `Hello!`);
  });
}
