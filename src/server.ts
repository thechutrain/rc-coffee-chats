import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import logger from './logger';
import { BOT_COMMANDS, MESSAGES } from './constants';
import { initZulipAPI } from './zulipMessenger';
import { isExceptionDay } from './utils';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// TODO -- this should be defined or updated whenever
// the server is pinged by the cron thingy
const zulipAPI = initZulipAPI(); // using default config from .env here

async function matchAndNotifyUsers() {
  const today = new Date();

  if (isExceptionDay(today)) {
    logger.info('Today is an exception day, no coffee chats T__T');
    return;
  }

  // Get array of emails for users subscribed to coffee bot stream
  const subscribedEmails = zulipAPI.users.map(user => user.email);

  // TODO: integrate with db stuff
  // .... reintegrate with current array of users??? (one data struct?)
  const userConfigs = await getUserConfigs({ emails: subscribedEmails });
  logger.info('userConfigs', userConfigs);

  // TODO: integrate with db stuff
  const todaysActiveEmails = await getEmailsForDay({
    emails: subscribedEmails,
    userConfigs,
    day: today.getDay()
  });
  logger.info('todaysActiveEmails', todaysActiveEmails);

  // TODO: integrate with db stuff
  const noEmailToday = await getEmailExceptions({ tableName: 'noNextMatch' });
  logger.info('noEmailToday', noEmailToday);

  const emailsToMatch = todaysActiveEmails.filter(
    email => !noEmailToday.includes(email)
  );
  logger.info('emailsToMatch', emailsToMatch);

  // IMPORTANT! Comment out this next line if you want to test something!!!
  // TODO: integrate with db stuff
  // clearNoNextMatchTable();

  // TODO: ...where's matchEmails defined now?
  const matchedEmails = await matchEmails({ emails: emailsToMatch });
  logger.info('matchedEmails', matchedEmails);

  // const matchedUsers = zulipAPI.users.filter( (user) => matchedEmails.includes(user.email) ).map( (user) => {...user, partner;

  /*
    user1,
    user2

  */

  // NOTE: matchedEmails is an array of arrays of strings, pairs of emails: [ [userEmail1, userEmail2] ]

  // IMPORTANT! Comment out this next part when testing things
  matchedEmails.forEach(email => sendMessage(email, '...msg...'));

  matchedEmails.forEach(match => {
    const sortedMatch = match.sort();
    const user1;
    // TODO: db!
    /* db.run(
        `INSERT INTO matches(date, email1, email2) VALUES ("${
          new Date().toISOString().split("T")[0]
        }", "${sortedMatch[0]}", "${sortedMatch[1]}")`
      );
    */

    // TODO -- refactor the messages!
    const message1 = `Hi there! You're having coffee (or tea, or a walk, or whatever you fancy) with @**${matchedName}** today - enjoy! See [${
      matchedName.split(' ')[0]
    }'s profile](https://www.recurse.com/directory?q=${encodeURIComponent(
      matchedName
    )}) for more details. 

*Reply to me with "help" to change how often you get matches.*
*Your current days are: ${coffeeDaysEnumToString(
      (userConfig && userConfig.coffee_days) || process.env.DEFAULT_COFFEE_DAYS
    )}*`;

    const message2 = `Hi there! You're having coffee (or tea, or a walk, or whatever you fancy) with @**${matchedName}** today - enjoy! See [${
      matchedName.split(' ')[0]
    }'s profile](https://www.recurse.com/directory?q=${encodeURIComponent(
      matchedName
    )}) for more details. 

*Reply to me with "help" to change how often you get matches.*
*Your current days are: ${coffeeDaysEnumToString(
      (userConfig && userConfig.coffee_days) || process.env.DEFAULT_COFFEE_DAYS
    )}*`;

    /*

  sendMessage({
        zulipAPI,
        toEmail: match[0],
        matchedName: tryToGetUsernameWithEmail({ users, email: match[1] }),
        userConfig: userConfigs.filter(c => c.email === match[0])[0],
      });
  
    sendMessage({
        zulipAPI,
        toEmail: match[1],
        matchedName: tryToGetUsernameWithEmail({ users, email: match[0] }),
        userConfig: userConfigs.filter(c => c.email === match[1])[0],
      });
  // sendAllMessages({ zulipAPI, matchedEmails, users, userConfigs });
*/
  });
}

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/cron/run', (request, response) => {
  // logger.info('Running the matcher and sending out matches');
  if (request.headers.secret === process.env.RUN_SECRET) {
    console.log('Run the main function here');
    matchAndNotifyUsers();
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
