// const zulip = require('zulip-js');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const fs = require('fs');
// const shuffle = require('lodash/shuffle');
// import * as zulip from 'zulip-js'
// import {express} from 'express'
// import * as bodyParser from 'body-parser'
// import * as fs from 'fs'
// import {shuffle} from 'lodash';

const PORT = process.env.PORT || 3000;
const app = express();
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
