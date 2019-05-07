/** NOTE: not a cron job, but a script that will notify users of message:
 *
 */
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from '../../olddb';
import { sendGenericMessage } from '../../zulip-messenger/msg-sender';

function sendUserNotification(msg: string) {
  const db = initDB();
  const activeUsers = db.User.findActiveUsers();

  console.log(activeUsers);

  activeUsers.forEach(user => {
    sendGenericMessage(user.email, msg);
  });
}

const customMessage = `Hello and welcome to Coffee Chat 2.0 ☕️. \nI've been brewing for a while, so I hope I don't blow you away with my strong, bold flavors. But just like our coffee pot in the kitchen there may be some cracks in me. If you find a 🐞 don't worry, just post an issue on github [here](https://github.com/thechutrain/rc-coffee-chats/issues).
\nYou can also find all my code and documentation on github: [https://github.com/thechutrain/rc-coffee-chats](https://github.com/thechutrain/rc-coffee-chats)
\n Documentation for my new CLI can be found [here](https://github.com/thechutrain/rc-coffee-chats/wiki/DOCS)
\nIf you're ever confused, just type **HELP** to learn more.
`;

sendUserNotification(customMessage);
