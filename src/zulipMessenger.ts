import logger from './logger';
import * as zulip from 'zulip-js';
import { stringifyWeekDays } from './utils';

export const initZulipAPI = (zulipConfig = {}) => {
  const zulipConfig = {
    username: zulipConfig.ZULIP_USERNAME || process.env.ZULIP_USERNAME,
    apiKey: zulipConfig.ZULIP_ZULIP_API_KEY || process.env.ZULIP_API_KEY,
    realm: zulipConfig.ZULIP_REALM || process.env.ZULIP_REALM
  };

  // set up Zulip JS library
  const zulipAPI = await zulip(zulipConfig);

  const getSubscribedEmails = async ({ zulipAPI, users }) => {
    // retrieve the subscriptions for the Coffee Chat Bot in order to find the other
    // emails that are subscribed to the Coffee Chats channel. This is the only way to
    // get all subs for a channel from the Zulip API, as far as we could see
    const botSubsResponse = await zulipAPI.streams.subscriptions.retrieve();
    const botSubs = botSubsResponse.subscriptions;
    const allSubscribedEmails = botSubs.filter(
      sub => sub.stream_id === 142655
    )[0].subscribers;
    // need to remember to remove all the bots that are in the channel
    return allSubscribedEmails.filter(email => {
      return (
        email !== zulipConfig.username &&
        !getUserWithEmail({ users, email }).is_bot
      );
    });
  };

  const sendMessage = ({ zulipAPI, toEmail, matchedName, userConfig }) => {
    let coffeeDayNumbers =
      (userConfig && userConfig.coffee_days) || process.env.DEFAULT_COFFEE_DAYS;
    let coffeeDaysString = stringifyWeekDays(coffeeDayNumbers);
    zulipAPI.messages.send({
      to: toEmail,
      type: 'private',
      content: `Hi there! You're having coffee (or tea, or a walk, or whatever you fancy) with @**${matchedName}** today - enjoy! See [${
        matchedName.split(' ')[0]
      }'s profile](https://www.recurse.com/directory?q=${encodeURIComponent(
        matchedName
      )}) for more details. 

*Reply to me with "help" to change how often you get matches.*
*Your current days are: ${coffeeDaysString}*`
    });
  };

  // TODO: re-implement coffeeDaysEnumToString using typescript enum.. call it stringifyCoffeeDays ?

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

  const handlePrivateMessageToBot = async body => {
    logger.info('handlePrivateMessageToBot', body);
    const zulipAPI = await zulip(zulipConfig);
    const message = body.data.toLowerCase();
    const fromEmail = body.message.sender_email;
    const coffeeDaysMatch = message.match(/^[0-6]+$/);
    if (coffeeDaysMatch) {
      const coffeeDayNumbers = coffeeDaysMatch[0];
      const coffeeDaysString = stringifyWeekDays(coffeeDayNumbers);
      db.serialize(() => {
        db.run(
          'INSERT OR REPLACE INTO users(email, coffee_days) VALUES (?, ?)',
          fromEmail,
          coffeeDayNumbers
        );
      });
      zulipAPI.messages.send({
        to: fromEmail,
        type: 'private',
        content: `We changed your coffee chat days to: **${coffeeDaysString}** 🎊`
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

  return {
    getSubscribedEmails,
    sendMessage,
    sendAllMessages,
    sendWarningMessages,
    handlePrivateMessageToBot
  };
};
