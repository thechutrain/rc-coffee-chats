const zulip = require('zulip-js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const shuffle = require('lodash/shuffle');
// import * as zulip from 'zulip-js'
// import {express} from 'express'
// import * as bodyParser from 'body-parser'
// import * as fs from 'fs'
// import {shuffle} from 'lodash';

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

const coffeeDaysMap = {
  '0': 'Sunday',
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday'
};

// http://expressjs.com/en/starter/static-files.html
const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// init sqlite db
const dbFile = './.data/sqlite.db';
const exists = fs.existsSync(dbFile);
import * as nonVerboseSqlite3 from 'sqlite3';
const sqlite3 = nonVerboseSqlite3.verbose();
const db = new sqlite3.Database(dbFile);

const createUsersMigration = () => {
  db.serialize(() => {
    db.run(
      'CREATE TABLE IF NOT EXISTS users (email STRING NOT NULL UNIQUE, coffee_days STRING NOT NULL);'
    );
    db.serialize(() => {
      db.run('CREATE INDEX IF NOT EXISTS users_email_index ON users (email);');
    });
  });
};

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
  if (!exists) {
    db.run(`CREATE TABLE matches ( 
              date TEXT NOT NULL,  
              email1 TEXT NOT NULL, 
              email2 TEXT NOT NULL
            );`);
    db.serialize(() => {
      db.run('CREATE INDEX date_index ON matches (date)');
      db.run('CREATE INDEX email1_index ON matches (email1)');
      db.run('CREATE INDEX email2_index ON matches (email2)');
      db.run('CREATE INDEX email1_email2_index ON matches (email1, email2)');
      logger.info('New table "matches" created!');
    });
    db.run(`CREATE TABLE warningsExceptions ( 
          email TEXT NOT NULL
    );`);
    db.run(`CREATE TABLE noNextMatch ( 
          email TEXT NOT NULL
    );`);
  } else {
    createUsersMigration();
    logger.info('Database "matches" ready to go!');
  }
});

const getUserConfigs = async ({ emails }) => {
  const userConfigs = await new Promise((resolve, reject) => {
    db.all(
      `SELECT email, coffee_days
            FROM users 
            WHERE email in ("${emails.join('","')}")`,
      [],
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });
  return userConfigs;
};

// TODO: abstract this and getEmailsNoNextMatch into one function w string param
// and pull map to list of emails into it
const getEmailExceptions = async ({ tableName }) => {
  let rowsAsMap: any[];
  await new Promise((resolve, reject) => {
    db.all(`SELECT email FROM ${tableName}`, (err, rows) => {
      rowsAsMap = rows;
      err ? reject(err) : resolve(rows);
    });
  });
  const exceptionsList = rowsAsMap.map(v => v.email);

  return exceptionsList;
};

// const getWarningsExceptions = async () => {
//   const rows = await new Promise((resolve, reject) => {
//     db.all(
//       `SELECT email FROM warningsExceptions`,
//       (err, rows) => (err ? reject(err) :  resolve(rows))
//     );
//   });
//   return rows
// }

// const getEmailsNoNextMatch = async () => {
//   const rows = await new Promise((resolve, reject) => {
//     db.all(
//       `SELECT email FROM noNextMatch`,
//       (err, rows) => (err ? reject(err) :  resolve(rows))
//     );
//   });
//   return rows;
// }

// coffee_days is formatted as a string of ints mapped to days 0123456 (Sunday = 0)
const getEmailsForDay = async ({ emails, userConfigs, day }) => {
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

// set up Zulip JS library
const zulipConfig = {
  username: process.env.ZULIP_USERNAME,
  apiKey: process.env.ZULIP_API_KEY,
  realm: process.env.ZULIP_REALM
};

const oddNumberBackupEmails = ['alicia@recurse.com'];

const getSubscribedEmails = async ({ zulipAPI, users }) => {
  // retrieve the subscriptions for the Coffee Chat Bot in order to find the other
  // emails that are subscribed to the Coffee Chats channel. This is the only way to
  // get all subs for a channel from the Zulip API, as far as we could see
  const botSubsResponse = await zulipAPI.streams.subscriptions.retrieve();
  const botSubs = botSubsResponse.subscriptions;
  const allSubscribedEmails = botSubs.filter(sub => sub.stream_id === 142655)[0]
    .subscribers;
  // need to remember to remove all the bots that are in the channel
  return allSubscribedEmails.filter(email => {
    return (
      email !== zulipConfig.username &&
      !getUserWithEmail({ users, email }).is_bot
    );
  });
};

const getUserWithEmail = ({ users, email }) => {
  return users.find(user => user.email === email);
};

const tryToGetUsernameWithEmail = ({ users, email }) => {
  try {
    return getUserWithEmail({ users, email }).full_name;
  } catch (e) {
    return email;
  }
};

const coffeeDaysEnumToString = coffeeDays => {
  logger.info(typeof coffeeDays, coffeeDays);
  return String(coffeeDays)
    .split('')
    .map(v => coffeeDaysMap[v])
    .join(', ');
};

const matchEmails = async ({ emails }) => {
  const pastMatches = await new Promise((resolve, reject) => {
    db.all(
      `SELECT * 
            FROM matches 
            WHERE email1 in ("${emails.join('","')}")
            OR email2 in ("${emails.join('","')}")`,
      [],
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });

  const unmatchedEmails = shuffle(emails);
  const newMatches = [];

  while (unmatchedEmails.length > 0) {
    const currentEmail = unmatchedEmails.shift();
    const pastMatchedEmails = (pastMatches as any[])
      .filter(
        match => match.email1 === currentEmail || match.email2 === currentEmail
      ) // filter to current email's matches
      .sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date))) // sort oldest to newest, so if there is a conflict we can rematch with oldest first
      .map(match =>
        match.email1 === currentEmail ? match.email2 : match.email1
      ) // extract only the other person's email out of the results (drop currentEmail and date)
      .filter(email => unmatchedEmails.includes(email)) // remove past matches who are not looking for a match today or who already got matched
      .filter((value, index, self) => self.indexOf(value) === index); // uniq emails // TODO: this should be a reduce that adds a match count to every email so we can factor that into matches

    const availableEmails = unmatchedEmails.filter(
      email => !pastMatchedEmails.includes(email)
    );

    if (availableEmails.length > 0) {
      // TODO: potentialy prioritize matching people from different batches
      newMatches.push([currentEmail, availableEmails[0]]);
      unmatchedEmails.splice(unmatchedEmails.indexOf(availableEmails[0]), 1);
    } else if (pastMatchedEmails.length > 0 && unmatchedEmails.length > 0) {
      newMatches.push([currentEmail, pastMatchedEmails[0]]);
      unmatchedEmails.splice(unmatchedEmails.indexOf(pastMatchedEmails[0]), 1);
    } else {
      // this should only happen on an odd number of emails
      // TODO: how to handle the odd person
      newMatches.push([
        currentEmail,
        oddNumberBackupEmails[
          Math.floor(Math.random() * oddNumberBackupEmails.length)
        ]
      ]);
    }
    // logger.info("<<<<<<", newMatches);
  }
  return newMatches;
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

const sendAllMessages = ({ zulipAPI, matchedEmails, users, userConfigs }) => {
  db.serialize(() => {
    matchedEmails.forEach(match => {
      const sortedMatch = match.sort();
      db.run(
        `INSERT INTO matches(date, email1, email2) VALUES ("${
          new Date().toISOString().split('T')[0]
        }", "${sortedMatch[0]}", "${sortedMatch[1]}")`
      );
      sendMessage({
        zulipAPI,
        toEmail: match[0],
        matchedName: tryToGetUsernameWithEmail({ users, email: match[1] }),
        userConfig: userConfigs.filter(c => c.email === match[0])[0]
      });
      sendMessage({
        zulipAPI,
        toEmail: match[1],
        matchedName: tryToGetUsernameWithEmail({ users, email: match[0] }),
        userConfig: userConfigs.filter(c => c.email === match[1])[0]
      });
    });
  });
};

const sendWarningMessages = ({ zulipAPI, warningMessageEmails }) => {
  db.serialize(() => {
    warningMessageEmails.forEach(email => {
      zulipAPI.messages.send({
        to: email,
        type: 'private',
        content: `Hi there, You will be matched tomorrow for a coffee chat. 
              If you don't want to be matched tomorrow reply to me with "cancel next match". 
              If you no longer want to receive these warning messages, reply to me with a message "warnings off".
              If you don't want to participate in the coffee chats anymore, unsubscribe from "coffee chats" channel.`
      });
    });
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

  const zulipAPI = await zulip(zulipConfig);
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

const clearNoNextMatchTable = async () => {
  db.serialize(() => {
    db.run(`DELETE FROM noNextMatch`);
  });
};

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

const handlePrivateMessageToBot = async body => {
  logger.info('handlePrivateMessageToBot', body);
  const zulipAPI = await zulip(zulipConfig);
  const message = body.data.toLowerCase();
  const fromEmail = body.message.sender_email;
  const coffeeDaysMatch = message.match(/^[0-6]+$/);
  if (coffeeDaysMatch) {
    const coffeeDays = coffeeDaysMatch[0];
    db.serialize(() => {
      db.run(
        'INSERT OR REPLACE INTO users(email, coffee_days) VALUES (?, ?)',
        fromEmail,
        coffeeDays
      );
    });
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
