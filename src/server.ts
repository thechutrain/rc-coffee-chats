import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import logger from './logger';
import { BOT_COMMANDS, MESSAGES } from './constants';
import { initZulipAPI } from './zulipMessenger';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const zulipAPI = initZulipAPI();

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/cron/run', (request, response) => {
  // logger.info('Running the matcher and sending out matches');
  if (request.headers.secret === process.env.RUN_SECRET) {
    console.log('Run the main function here');
    // _run();
  }
  response.status(200).json({ status: 'ok' });
});

app.post('/cron/run/warnings', (request, response) => {
  // logger.info('Sending warning messages about tomorrow matches');
  if (request.headers.secret === process.env.RUN_SECRET) {
    console.log('run warning messages here');
    // runWarningMessages();
  }
  response.status(200).json({ status: 'ok' });
});

// Handle messages received from Zulip outgoing webhooks
// (when users @mention the coffee bot)
app.post('/webhooks/zulip', (request, response) => {
  const userMessage = body.data.toLowerCase();
  const userEmail = body.message.sender_email;

  const coffeeDaysMatch = message.match(/^[0-6]+$/);

  if (coffeeDaysMatch) {
    // TODO: link this to database functions
    insertCoffeeDaysForUser(userEmail, coffeeDaysMatch[0]);

    const replyMessage = `We changed your coffee chat days to: **${stringifyWeekDays(
      coffeeDaysMatch[0]
    )}** 🎊`;

    zulipAPI.sendMessage(userEmail, replyMessage);
  } else if (userMessage === BOT_COMMANDS.WARNINGS_OFF) {
    // TODO:
    /*
       db.serialize(() => {
       db.run(
         'INSERT OR REPLACE INTO warningsExceptions(email) VALUES (?)',
         fromEmail
       );
     });
    */
    zulipAPI.sendMessage(userEmail, MESSAGES.WARNINGS_OFF);
  } else if (userMessage === BOT_COMMANDS.WARNINGS_ON) {
    // TODO:
    /*      db.serialize(() => {
       db.run('DELETE FROM warningsExceptions WHERE email=?', fromEmail);
     });
    */

    zulipAPI.sendMessage(userEmail, MESSAGES.WARNINGS_ON);
  } else if (userMessage === BOT_COMMANDS.CANCEL_NEXT) {
    // TODO:
    /*
     db.serialize(() => {
       db.run('insert into noNextMatch (email) values(?)', fromEmail);
     });

       */

    zulipAPI.sendMessage(userEmail, MESSAGES.CANCEL_NEXT);

    // DEFAULT: if no recognizable command, send "help" info
  } else {
    zulipAPI.sendMessage(userEmail, MESSAGES.INFO);
  }

  // See: https://zulipchat.com/api/outgoing-webhooks
  response.status(200).json({ response_not_required: true });

  // TODO: send response with content key instead of the above,
  // (and instead of calling zulipAPI.sendMessage)!
  // ...only reply if request came from a user via private message?
});

// listen for requests :)
const listener = app.listen(PORT, () => {
  console.log(`🌍 is listening on port: ${PORT}`);
  // logger.info('Your app is listening on port ' + listener.address().port);
});
