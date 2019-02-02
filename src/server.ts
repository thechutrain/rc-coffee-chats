import express from 'express';
import bodyParser from 'body-parser';
// import path from 'path';
import logger from './logger';
import { parseZulipServerRequest } from './zulip_coms/zulipCli';

const PORT = process.env.PORT || 3000;

/////////////////
/// Database
/////////////////
import { initDB } from './db/db';
const DB_FILE_NAME =
  process.env.NODE_ENV === 'production' ? 'prod.db' : 'dev.db';
console.log(DB_FILE_NAME);
const { user } = initDB(DB_FILE_NAME);

user.createTable();

//  ====================
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// const zulipAPI = initZulipAPI(); // using default config from .env here

app.get('/', (request, response) => {
  logger.info('this is a test log from the / route');
  response.send('Hi');
});

app.get('/user/add/:name', (request, response) => {
  logger.info('received /user/add/:name');
  const { status } = user.add({
    email: `${request.params.name}`,
    full_name: 'test name'
  });
  response.send(status);
});

app.get('/user/find/:name', (request, response) => {
  logger.info('received /user/find');
  console.log(request.params.name);
  const { payload } = user.find(`${request.params.name}`);
  response.json(payload);
});

app.get('/make-user', (request, response) => {
  const age = Math.floor(Math.random() * 40) + 18;
});

app.post('/cron/run', (request, response) => {
  // logger.info('Running the matcher and sending out matches');
  if (request.headers.secret === process.env.RUN_SECRET) {
    console.log('Run the main function here');
  }
  response.status(200).json({ status: 'ok' });
});

// app.post('/cron/run/warnings', (request, response) => {
//   // logger.info('Sending warning messages about tomorrow matches');
//   if (request.headers.secret === process.env.RUN_SECRET) {
//     console.log('run warning messages here');
//     // runWarningMessages();
//   }
//   response.status(200).json({ status: 'ok' });
// });
app.post('/webhooks/zulip', (req, res) => {
  // const requestBody = request.body;
  // const userMessage = request.body.data;
  console.log(req.body);
  const cliAction = parseZulipServerRequest(req.body);
  console.log('action --->');
  console.log(cliAction);
  res.json(cliAction);
});
// Handle messages received from Zulip outgoing webhooks
// (when users @mention the coffee bot)
// app.post('/webhooks/zulip', (request, response) => {
//   const userMessage = body.data.toLowerCase();
//   const userEmail = body.message.sender_email;

//   const coffeeDaysMatch = message.match(/^[0-6]+$/);

//   if (coffeeDaysMatch) {
//     // TODO: link this to database functions
//     insertCoffeeDaysForUser(userEmail, coffeeDaysMatch[0]);

//     const replyMessage = `We changed your coffee chat days to: **${stringifyWeekDays(
//       coffeeDaysMatch[0]
//     )}** 🎊`;

//     zulipAPI.sendMessage(userEmail, replyMessage);
//   } else if (userMessage === BOT_COMMANDS.WARNINGS_OFF) {
//     // TODO:
//     /*
//        db.serialize(() => {
//        db.run(
//          'INSERT OR REPLACE INTO warningsExceptions(email) VALUES (?)',
//          fromEmail
//        );
//      });
//     */
//     zulipAPI.sendMessage(userEmail, MESSAGES.WARNINGS_OFF);
//   } else if (userMessage === BOT_COMMANDS.WARNINGS_ON) {
//     // TODO:
//     /*      db.serialize(() => {
//        db.run('DELETE FROM warningsExceptions WHERE email=?', fromEmail);
//      });
//     */

//     zulipAPI.sendMessage(userEmail, MESSAGES.WARNINGS_ON);
//   } else if (userMessage === BOT_COMMANDS.CANCEL_NEXT) {
//     // TODO:
//     /*
//      db.serialize(() => {
//        db.run('insert into noNextMatch (email) values(?)', fromEmail);
//      });

//        */

//     zulipAPI.sendMessage(userEmail, MESSAGES.CANCEL_NEXT);

//     // DEFAULT: if no recognizable command, send "help" info
//   } else {
//     zulipAPI.sendMessage(userEmail, MESSAGES.INFO);
//   }

//   // See: https://zulipchat.com/api/outgoing-webhooks
//   response.status(200).json({ response_not_required: true });

//   // TODO: send response with content key instead of the above,
//   // (and instead of calling zulipAPI.sendMessage)!
//   // ...only reply if request came from a user via private message?
// });

// listen for requests :)
const listener = app.listen(PORT, () => {
  console.log(`🌍 is listening on port: ${PORT}`);
  // logger.info('Your app is listening on port ' + listener.address().port);
});
