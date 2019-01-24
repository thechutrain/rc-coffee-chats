import { logger } from './logger';
import { WEEKDAYS, EXCEPTION_DATES, oddNumberBackupEmails } from './constants';
import { initZulipAPI } from './zulipMessenger';

const express = require('express');
const bodyParser = require('body-parser');
const shuffle = require('lodash/shuffle');
// import * as zulip from 'zulip-js'
// import {express} from 'express'
// import * as bodyParser from 'body-parser'
// import * as fs from 'fs'
// import {shuffle} from 'lodash';

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const tryToGetUsernameWithEmail = ({ users, email }) => {
  try {
    return getUserWithEmail({ users, email }).full_name;
  } catch (e) {
    return email;
  }
};

const sendMessage = ({ zulipAPI, toEmail, matchedName, userConfig }) => {
  zulipAPI.messages.send({
    to: toEmail,
    type: 'private',
    content: `Hi there! You're having coffee (or tea, or a walk, or whatever you fancy) with @**${matchedName}** today - enjoy! See [${
      matchedName.split(' ')[0]
    }'s profile](https://www.recurse.com/directory?q=${encodeURIComponent(
      matchedName
    )}) for more details. 

*Reply to me with "help" to change how often you get matches.*
*Your current days are: ${coffeeDaysEnumToString(
      (userConfig && userConfig.coffee_days) || process.env.DEFAULT_COFFEE_DAYS
    )}*`
  });
};

const isExceptionDay = day => {
  const inUTC = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
  for (const i in EXCEPTION_DATES) {
    if (EXCEPTION_DATES[i] === inUTC) {
      return true;
    }
  }
  return false;
};

// TODO: run conflicts with the type definiton in mocha file, ask TENOR
// tslint:disable-next-line
const _run = async () => {
  logger.info('-----------');
  const today = new Date();

  if (isExceptionDay(today)) {
    logger.info('Today is an exception day, no coffee chats T__T');
    return;
  }

  const zulipAPI = await initZulipAPI();
  const users = (await zulipAPI.users.retrieve()).members;

  const activeEmails = await getSubscribedEmails({ zulipAPI, users });
  logger.info('activeEmails', activeEmails);

  const userConfigs = await getUserConfigs({ emails: activeEmails });
  logger.info('userConfigs', userConfigs);

  const todaysActiveEmails = await getEmailsForDay({
    emails: activeEmails,
    userConfigs,
    day: today.getDay()
  });
  logger.info('todaysActiveEmails', todaysActiveEmails);

  const noEmailToday = await getEmailExceptions({ tableName: 'noNextMatch' });
  logger.info('noEmailToday', noEmailToday);

  const emailsToMatch = todaysActiveEmails.filter(
    email => !noEmailToday.includes(email)
  );
  logger.info('emailsToMatch', emailsToMatch);

  // IMPORTANT! Comment out this next line if you want to test something!!!
  clearNoNextMatchTable();

  const matchedEmails = await matchEmails({ emails: emailsToMatch });
  logger.info('matchedEmails', matchedEmails);

  // IMPORTANT! Comment out this next line if you want to test something!!!
  sendAllMessages({ zulipAPI, matchedEmails, users, userConfigs });
};

// IMPORTANT! Do not comment out this next line UNLESS sendAllMessages is
// commented out in the run() function
// run();

const runWarningMessages = async () => {
  logger.info('-----------');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isExceptionDay(tomorrow)) {
    logger.info('Tomorrow is an exception day, no coffee chats, no warnings');
    return;
  }

  const zulipAPI = await zulip(zulipConfig);
  const users = (await zulipAPI.users.retrieve()).members;

  const subscribedEmails = await getSubscribedEmails({ zulipAPI, users });
  logger.info('subscribedEmails', subscribedEmails);

  const userConfigs = await getUserConfigs({ emails: subscribedEmails });
  logger.info('userConfigs', userConfigs);

  const emailsForTomorrow = await getEmailsForDay({
    emails: subscribedEmails,
    userConfigs,
    day: tomorrow.getDay()
  });
  logger.info('emailsForTomorrow', emailsForTomorrow);

  const warningsExceptions = await getEmailExceptions({
    tableName: 'warningsExceptions'
  });
  logger.info('warningsExceptions', warningsExceptions);

  const noEmailTomorrow = await getEmailExceptions({
    tableName: 'noNextMatch'
  });
  logger.info('noEmailTomorrow', noEmailTomorrow);

  const warningMessageEmails = emailsForTomorrow.filter(
    email =>
      !(warningsExceptions.includes(email) || noEmailTomorrow.includes(email))
  );
  logger.info('warningMessageEmails', warningMessageEmails);

  // Test:
  // const warningMessageEmails = [ 'nekanek@protonmail.com' ]
  // sendWarningMessages({ zulipAPI, warningMessageEmails });

  // IMPORTANT! Comment out this next line if you want to test something!!!
  sendWarningMessages({ zulipAPI, warningMessageEmails });
};

// IMPORTANT! comment "sendWarningMessages" line above before uncommenting the next line
// runWarningMessages();

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html'); // TODO: update this page
});

app.get('/test', (request, response) => {
  response.send('Working yooooo');
});

app.post('/cron/run', (request, response) => {
  logger.info('Running the matcher and sending out matches');
  if (request.headers.secret === process.env.RUN_SECRET) _run();
  response.status(200).json({ status: 'ok' });
});

app.post('/cron/run/warnings', (request, response) => {
  logger.info('Sending warning messages about tomorrow matches');
  if (request.headers.secret === process.env.RUN_SECRET) runWarningMessages();
  response.status(200).json({ status: 'ok' });
});

app.post('/webhooks/zulip', (request, response) => {
  handlePrivateMessageToBot(request.body);
  response.status(200).json({ status: 'ok' });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  logger.info('Your app is listening on port ' + listener.address().port);
});

const testDB = () => {
  db.all(
    'SELECT * FROM matches WHERE email1 = "test@test.com" OR email2="test@test.com"',
    (err, rows) => {
      logger.info(rows);
    }
  );
};
const testMatches = async () => {
  const zulipAPI = await zulip(zulipConfig);
  const users = (await zulipAPI.users.retrieve()).members;

  const activeEmails = await getSubscribedEmails({ zulipAPI, users });
  logger.info(activeEmails);
  const todaysActiveEmails = await getEmailsForDay({
    emails: activeEmails,
    day: new Date().getDay(),
    userConfigs: null // TODO: look at later, fixes TS compile error
  });
  logger.info(todaysActiveEmails);
  const matchedEmails = await matchEmails({ emails: todaysActiveEmails });
  logger.info(JSON.stringify(matchedEmails));
};

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
