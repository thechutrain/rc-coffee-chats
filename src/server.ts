import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import logger from './logger';
import { BOT_COMMANDS, MESSAGES, oddNumberBackupUsers } from './constants';
import { initZulipAPI } from './zulipMessenger';
import { isExceptionDay } from './utils';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// TODO -- this should be defined or updated whenever
// the server is pinged by the cron thingy!!!
const zulipAPI = initZulipAPI(); // using default config from .env here

// This function receives an array of IZulipUser who want a coffee chat partner today
// TODO -- typescript issue: will this work if IZulipUser interface is defined elsewhere?
async function getMatchedUserPairs(
  usersAvailableToday: IZulipUser[]
): IZulipUser[] {
  // DB CALL -- get past matches...... what's the data format here???
  let pastMatches = []; // STUFF GOES HERE

  /* PAST MATCHES: array of objects with date, email1, email2
  [ { date: '2019-01-14',
      email1: '',
      email2: ''
    },
    {...}
  ]
*/

  let unmatchedUsers = shuffle(usersAvailableToday);

  const unmatchedUsersEmails = unmatchedUsersEmails.map(user => user.email);
  const newMatches: IZulipUser[] = []; //.... yes or no for TypeScript? =P

  // Sort through all the users
  while (unmatchedUsers.length > 0) {
    // Remove from list one by one as people get paired up
    const currentUser = unmatchedUsers.shift();

    // Get list of the current person's past matches as an array of users
    const pastMatchedEmailsAvailableToday = pastMatches
      .filter(
        match =>
          match.email1 === currentUser.email ||
          match.email2 === currentUser.email
      ) // filter to current user...
      .sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date))) // sort oldest to newest, so if there is a conflict we can rematch with oldest first
      .map(match =>
        match.email1 === currentUser.email ? match.email2 : match.email1
      ) // extract only the other person's email out of the results (drop currentEmail ...
      .filter(email => unmatchedUsersEmails.includes(email)) // remove past matches who are not looking for a match today or who already got matched
      // (note: they did this because past matches are the fallback option in case no new matches are available;
      //        any match NEEDS to be someone available today.)
      .filter((value, index, self) => self.indexOf(value) === index); // uniq emails // TODO: this should be a reduce that adds a match count to every email so we can factor that into matches

    // ...convert array of emails to array of users:
    const pastMatchedUsersAvailableToday = unmatchedUsers.filter(user =>
      pastMatchedUsersAvailableToday.includes(user.email)
    );

    // Get possible NEW matches for the current person: users available today who the current person has NOT previously matched with
    const availableNewUsers = unmatchedUsers.filter(
      user => !pastMatchedEmailsAvailableToday.includes(user.email)
    );

    // NOTE -- splice and indexOf for arrays of objects should work as long as the two arrays unmatchedUsers and availableNewUsers / pastMatchedUsersAvailableToday are referring to the same object refs!

    if (availableNewUsers.length > 0) {
      // TODO: potentialy prioritize matching people from different batches
      newMatches.push([currentUser, availableNewUsers[0]]);
      unmatchedUsers.splice(unmatchedUsers.indexOf(availableNewUsers[0]), 1);

      // If no available NEW matches, then match current user with one of their past matches
    } else if (
      pastMatchedUsersAvailableToday.length > 0 &&
      unmatchedUsers.length > 0
    ) {
      newMatches.push([currentUser, pastMatchedUsersAvailableToday[0]]);
      unmatchedUsers.splice(
        unmatchedUsers.indexOf(pastMatchedUsersAvailableToday[0]),
        1
      );
    } else {
      // this should only happen on an odd number of emails
      // TODO: how to handle the odd person
      newMatches.push([
        currentUser,
        oddNumberBackupUsers[
          Math.floor(Math.random() * oddNumberBackupUsers.length)
        ]
      ]);
    }
    // logger.info("<<<<<<", newMatches);
  }
  return newMatches;
}

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

  const usersToMatch = zulipAPI.users.map(user =>
    emailsToMatch.includes(user.email)
  );

  const matchedUserPairs = await getMatchedUserPairs(usersToMatch);

  // ******* SEND ALL MESSAGES *****
  // IMPORTANT! Comment out this next part when testing things
  matchedUserPairs.forEach(pair => {
    // why sort????
    const sortedMatch = pair.sort();

    const user1Email = pair[0].email;
    const user1FullName = pair[0].full_name;
    const user1FirstName = user1FullName.split(' ')[0];

    const user2Email = pair[1].email;
    const user2FullName = pair[1].full_name;
    const user2FirstName = user2FullName.split(' ')[0];

    // TODO: db!
    /* db.run(
        `INSERT INTO pair(date, email1, email2) VALUES ("${
          new Date().toISOString().split("T")[0]
        }", "${sortedMatch[0]}", "${sortedMatch[1]}")`
      );
    */

    // TODO -- refactor the messages!

    /* TODO -- reimplement the userConfig part of the message sent to users.
    const message1 = `Hi there! You're having coffee (or tea, or a walk, or whatever you fancy) with @**${user1FullName}** today - enjoy! See [${user1FirstName}'s profile](https://www.recurse.com/directory?q=${encodeURIComponent(user1FullName)}) for more details. 

*Reply to me with "help" to change how often you get matches.*
*Your current days are: ${coffeeDaysEnumToString(
      (userConfig && userConfig.coffee_days) || process.env.DEFAULT_COFFEE_DAYS
    )}*`;
  */

    // Send message1 to user2Email (tell user2 they've been matched with user1)
    const message1 = `Hi there! You're having coffee (or tea, or a walk, or whatever you fancy) with @**${user1FullName}** today - enjoy! See [${user1FirstName}'s profile](https://www.recurse.com/directory?q=${encodeURIComponent(
      user1FullName
    )}) for more details. 

*Reply to me with "help" to change how often you get matches.**`;

    // Send message2 to user1Email (tell user1 they've been matched with user2)
    const message2 = `Hi there! You're having coffee (or tea, or a walk, or whatever you fancy) with @**${user2FullName}** today - enjoy! See [${user2FirstName}'s profile](https://www.recurse.com/directory?q=${encodeURIComponent(
      user2FullName
    )}) for more details. 

*Reply to me with "help" to change how often you get matches.**`;

    zulipAPI.sendMessage(user2Email, message1);
    zulipAPI.sendMessage(user1Email, message2);
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
