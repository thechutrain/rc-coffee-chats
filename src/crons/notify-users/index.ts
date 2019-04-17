/** NOTE: not a cron job, but a script that will notify users of message:
 *
 */
import { initDB } from '../../db';
import { sendGenericMessage } from '../../zulip-messenger/msg-sender';

export function sendUserNotification(message: string) {
  const db = initDB();
  const activeUsers = db.User.findActiveUsers();

  console.log(activeUsers);

  activeUsers.forEach(user => {
    const customMessage = `Hello and welcome to Coffee Chat 2.0 ☕️. I've been brewing for a while, but just like our coffee pot there may be some cracks in me. If you find a 🐞 don't worry, just post an issue on github [here](https://github.com/thechutrain/rc-coffee-chats/issues).
    \nYou can also find all my code and documentation on github: [https://github.com/thechutrain/rc-coffee-chats](https://github.com/thechutrain/rc-coffee-chats)
    \nBut if you don't have time to read about my new changes, you can ask for **HELP**.
    No coffee pots were harmed in the making of this app.
    `;
    sendGenericMessage(user.email, customMessage);
  });
}
