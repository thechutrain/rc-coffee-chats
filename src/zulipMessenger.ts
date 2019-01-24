import logger from './logger';
import * as zulip from 'zulip-js';
import { getUserWithEmail, stringifyWeekDays } from './utils';
import { MESSAGES, BOT_COMMANDS } from './constants';

interface IZulipConfig {
  ZULIP_USERNAME?: string;
  ZULIP_API_KEY?: string;
  ZULIP_REALM?: string;
}

export const initZulipAPI = async (zulipConfig: IZulipConfig = {}) => {
  const config = {
    username: zulipConfig.ZULIP_USERNAME || process.env.ZULIP_USERNAME,
    apiKey: zulipConfig.ZULIP_API_KEY || process.env.ZULIP_API_KEY,
    realm: zulipConfig.ZULIP_REALM || process.env.ZULIP_REALM
  };

  // set up Zulip JS library
  const zulipAPI = await zulip(config);

  const getSubscribedEmails = async ({ users }) => {
    // retrieve the subscriptions for the Coffee Chat Bot in order to find the other
    // emails that are subscribed to the Coffee Chats channel. This is the only way to
    // get all subs for a channel from the Zulip API, as far as we could see
    const botSubsResponse = await zulipAPI.streams.subscriptions.retrieve();
    const botSubs = botSubsResponse.subscriptions;

    // TODO: save the Stream ID in .env or constants, not hard-coded! =P
    const allSubscribedEmails = botSubs.filter(
      sub => sub.stream_id === 142655
    )[0].subscribers;

    // need to remember to remove all the bots that are in the channel
    return allSubscribedEmails.filter(email => {
      return (
        email !== config.username && !getUserWithEmail({ users, email }).is_bot
      );
    });
  };

  // TO DO: pass in a user object which contains that user's config info AND their email...
  // set their "coffee day numbers" before reaching this function (based on config OR default values)
  const sendMessage = ({ toEmail, matchedName, userConfig }) => {
    const coffeeDayNumbers =
      (userConfig && userConfig.coffee_days) || process.env.DEFAULT_COFFEE_DAYS;
    const coffeeDaysString = stringifyWeekDays(coffeeDayNumbers);
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

  const sendWarningMessage = toEmail => {
    zulipAPI.messages.send({
      to: toEmail,
      type: 'private',
      content: MESSAGES.WARNING
    });
  };

  // TO MOVE TO DB:
  // given list of matched emails, insert all new matches:
  /* 
  db.serialize(() => {
      matchedEmails.forEach(match => {
        const sortedMatch = match.sort();
        db.run(
          `INSERT INTO matches(date, email1, email2) VALUES ("${
            new Date().toISOString().split('T')[0]
          }", "${sortedMatch[0]}", "${sortedMatch[1]}")`
        );
      });
    });
  */

  // TO MOVE TO SERVER FILE:
  // - for all matched emails, call zulipFunc sendMessage
  // - for all warning message emails, call zulipFunc sendWarningMessage
  // - MOVE handlePrivateMessageToBot into server -- parse response, talk to db, and send zulip mesg
  //    ... so make sendMessage more reusable :)

  const handlePrivateMessageToBot = responseBody => {
    logger.info('handlePrivateMessageToBot', responseBody);

    // Parse response body
    const message = responseBody.data.toLowerCase();
    const fromEmail = responseBody.message.sender_email;

    // If user sends a string containing numbers 0 through 6:
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

    if (message === BOT_COMMANDS.WARNINGS_OFF) {
      db.serialize(() => {
        db.run(
          'INSERT OR REPLACE INTO warningsExceptions(email) VALUES (?)',
          fromEmail
        );
      });
      zulipAPI.messages.send({
        to: fromEmail,
        type: 'private',
        content: MESSAGES.WARNINGS_OFF
      });
      return;
    }

    if (message === BOT_COMMANDS.WARNINGS_ON) {
      db.serialize(() => {
        db.run('DELETE FROM warningsExceptions WHERE email=?', fromEmail);
      });
      zulipAPI.messages.send({
        to: fromEmail,
        type: 'private',
        content: MESSAGES.WARNINGS_ON
      });
      return;
    }

    if (message === BOT_COMMANDS.CANCEL_NEXT) {
      db.serialize(() => {
        db.run('insert into noNextMatch (email) values(?)', fromEmail);
      });
      zulipAPI.messages.send({
        to: fromEmail,
        type: 'private',
        content: MESSAGES.CANCEL_NEXT
      });
      return;
    }

    // OTHERWISE, if user message has no recognizable command, send the user general info on what commands are available
    zulipAPI.messages.send({
      to: fromEmail,
      type: 'private',
      content: MESSAGES.INFO
    });
  };

  return {
    getSubscribedEmails,
    sendMessage,
    sendWarningMessage,
    handlePrivateMessageToBot
  };
};
