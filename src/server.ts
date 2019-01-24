// const zulip = require('zulip-js');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const fs = require('fs');
import initDB from './database';

const { getUserConfigs, insertCoffeeDaysForUser } = initDB();
// const shuffle = require('lodash/shuffle');
// import * as zulip from 'zulip-js'
// import {express} from 'express'
// import * as bodyParser from 'body-parser'
// import * as fs from 'fs'
// import {shuffle} from 'lodash';

const PORT = process.env.PORT || 3000;
const app = express();

// coffee_days is formatted as a string of ints mapped to days 0123456 (Sunday = 0)
const getEmailsForDay = ({ emails, userConfigs, day }) => {
  const userConfigMap = userConfigs.reduce((acc, v) => {
    // acc[v['email']] = String(v['coffee_days']);
    acc[v.email] = String(v.coffee_days);
    return acc;
  }, {});

  const isDefaultDay = process.env.DEFAULT_COFFEE_DAYS.includes(day);
  return emails.filter(email => {
    const config = userConfigMap[email];
    if (!config && isDefaultDay) return true;
    if (config && config.includes(day)) return true;
    return false;
  });
};

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (request, response) => {
  const pathToHtml = path.join(__dirname, '..', 'views/index.html');
  console.log(pathToHtml);
  response.sendFile(pathToHtml);
  // response.sendFile(__dirname + '/views/index.html'); // TODO: update this page
});

app.get('/test', (request, response) => {
  response.send('Working yooooo');
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

app.post('/webhooks/zulip', (request, response) => {
  // handlePrivateMessageToBot(request.body);
  response.status(200).json({ status: 'ok' });
});

// listen for requests :)
const listener = app.listen(PORT, () => {
  console.log(`🌍 is listening on port: ${PORT}`);
  // logger.info('Your app is listening on port ' + listener.address().port);
});

const handlePrivateMessageToBot = async body => {
  logger.info('handlePrivateMessageToBot', body);
  const zulipAPI = await zulip(zulipConfig);
  const message = body.data.toLowerCase();
  const fromEmail = body.message.sender_email;
  const coffeeDaysMatch = message.match(/^[0-6]+$/);
  if (coffeeDaysMatch) {
    const coffeeDays = coffeeDaysMatch[0];
    insertCoffeeDaysForUser(fromEmail, coffeeDays);
    zulipAPI.messages.send({
      to: fromEmail,
      type: 'private',
      content: `We changed your coffee chat days to: **${coffeeDaysEnumToString(
        coffeeDays
      )}** 🎊`
    });
    return;
  }
  if (message === 'warnings off') {
    db.serialize(() => {
      db.run(
        'INSERT OR REPLACE INTO warningsExceptions(email) VALUES (?)',
        fromEmail
      );
    });
    zulipAPI.messages.send({
      to: fromEmail,
      type: 'private',
      content: `Hi! You've successfully unsubscribed from warning messages! (You are still going to be matched while subscribed to the channel).`
    });
    return;
  }
  if (message === 'warnings on') {
    db.serialize(() => {
      db.run('DELETE FROM warningsExceptions WHERE email=?', fromEmail);
    });
    zulipAPI.messages.send({
      to: fromEmail,
      type: 'private',
      content: `Hi! You've successfully subscribed to the warning messages!`
    });
    return;
  }
  if (message === 'cancel next match') {
    db.serialize(() => {
      db.run('insert into noNextMatch (email) values(?)', fromEmail);
    });
    zulipAPI.messages.send({
      to: fromEmail,
      type: 'private',
      content: `Hi! You've successfully cancelled your match for coffee tomorrow! Have a nice day!`
    });
    return;
  }

  zulipAPI.messages.send({
    to: fromEmail,
    type: 'private',
    content: `Hi! To change the days you get matched send me a message with any subset of the numbers 0123456.
0 = Sunday
1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday
E.g. Send "135" for matches on Monday, Wednesday, and Friday.

To unsubscribe from warning messages send me a message "warnings off".
To subscribe to the warning messages send me a message "warnings on".
`
  });
};

// ========= TESTS ============
// const testDB = () => {
//   db.all(
//     'SELECT * FROM matches WHERE email1 = "test@test.com" OR email2="test@test.com"',
//     (err, rows) => {
//       logger.info(rows);
//     }
//   );
// };

// const testMatches = async () => {
//   const zulipAPI = await zulip(zulipConfig);
//   const users = (await zulipAPI.users.retrieve()).members;

//   const activeEmails = await getSubscribedEmails({ zulipAPI, users });
//   // logger.info(activeEmails);
//   const todaysActiveEmails = await getEmailsForDay({
//     emails: activeEmails,
//     day: new Date().getDay(),
//     userConfigs: null // TODO: look at later, fixes TS compile error
//   });
//   // logger.info(todaysActiveEmails);
//   const matchedEmails = await matchEmails({ emails: todaysActiveEmails });
//   // logger.info(JSON.stringify(matchedEmails));
// };

// won't work till bot has admin privileges
// const removeSubs = async (emails) => {
//   const zulipAPI = await zulip(zulipConfig);
//   // const users = (await zulipAPI.users.retrieve()).members; // this is only needed if you want to remove by anything other than email

//   logger.info(await zulipAPI.users.me.subscriptions.remove({
//     subscriptions: JSON.stringify(["Coffee Chats"]),
//     principals: JSON.stringify(emails)
//   }))

// }

// removeSubs(["sheridan.kates@gmail.com"])
// testMatches()

// testDB()

// // util for testing messages
// const test = async () => {
//   // const zulipAPI = await zulip(zulipConfig);
//   // sendMessage({ zulipAPI, toEmail: "<>", matchedName: "<>" });
//   db.run('INSERT OR REPLACE INTO users(email, coffee_days) VALUES ("c", "3")');
//   logger.info(await getTodaysEmails({emails: ["c", "d"]}), (new Date("2018-10-07")).getDay());
// };
// test()
