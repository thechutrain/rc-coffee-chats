/**
 * This module is responsible for sending messages to end user
 * sent from our server --> bot/zulip server
 */

import axios from 'axios';
import { MsgTemplate, MsgCreaterMap } from '../types/msgTypes';

/** ======= Zulip-specific simple msg sender ========
 *
 * @param toEmail
 * @param messageContent
 *
 */
export function sendGenericMessage(
  toEmail: string | string[],
  messageContent: string
) {
  const rawData = {
    type: 'private',
    to: toEmail instanceof Array ? toEmail.join(', ') : toEmail,
    content: encodeURIComponent(messageContent)
  };

  const dataAsQueryParams = Object.keys(rawData)
    .map(key => `${key}=${rawData[key]}`)
    .join('&');

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `sendGenericMessage(): Skipping Message Sending b/c you'e not in prod:`
    );
    console.log({ toEmail, messageContent });
    return;
  }

  return axios.post(`${process.env.ZULIP_URL_ENDPOINT}`, dataAsQueryParams, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: `${process.env.ZULIP_BOT_USERNAME}`,
      password: `${process.env.ZULIP_BOT_API_KEY}`
    }
  });
}

/** ===== message sender that sends a message from template ====
 *
 * @param toEmail
 * @param messageType
 * @param msgOpt
 */
export function templateMessageSender(
  toEmail: string | string[],
  messageType: MsgTemplate,
  msgOpt: any = {}
) {
  const messageContent = createMessageContent(messageType, msgOpt);
  sendGenericMessage(toEmail, messageContent);
}

/** ======= createMessageContent() ======
 * creates message content string from specific msg type & provided arguments
 * @param messageType
 * @param overloadArgs
 */
export function createMessageContent(
  messageType: MsgTemplate,
  overloadArgs = {}
): string {
  const vars: any = overloadArgs;

  // TODO: validate that all vars exist on overloadArgs!

  const msgCreaterMap: MsgCreaterMap = {
    ////////////////////////
    // Registration related messages
    ////////////////////////
    PROMPT_SIGNUP: {
      template: `Hello there! I'm the new :coffee: chat bot!
      You are not currently registered as a user of coffee chats.
      If you would like to join, just type: **SIGNUP**`
    },
    SIGNED_UP: {
      template: `You've successfully been added to coffee chat! 🎉
      You can learn more at [github.com/thechutrain/rc-coffee-chats](https://github.com/thechutrain/rc-coffee-chats)
      or just type: **HELP**`
    },
    ////////////////////////
    // Activate related messages
    ////////////////////////
    PROMPT_ACTIVATE: {
      template: `Hi, looks like you are not currently an active user of chat bot and will not be paired with anyone for any chats. You can type: *ACTIVATE* to rejoin.`
    },
    ACTIVATE: {
      template: `Welcome back to Chat Bot! 🎉 \nYou can type: \`\`\`HELP\`\`\` or go to the [wikis](https://github.com/thechutrain/rc-coffee-chats/wiki) to learn more`
    },
    DEACTIVATE: {
      template: `Your account has been deactivated 😭\n We're sad to see you go, but we hope you've had some wonderful chats at RC!`
    },

    ////////////////////////
    // Messages related to SHOW actions
    ////////////////////////

    // STATUS: {},
    STATUS_DAYS: {
      reqVars: ['coffeeDays'],
      template: `You are currently set to have coffee chats on the following days: ${
        vars.coffeeDays
      }`
    },
    STATUS_SKIPPING: {
      template: `You will be skipping your next scheduled match\n *SKIPPING* is set to "YES"`
    },
    STATUS_NOT_SKIPPING: {
      template: `You will be matched according to your regular schedule. \n *SKIPPING* is set to "NO"`
    },
    STATUS_WARNINGS_ON: {
      template: `Your warning notifications are turned *ON*. \n\nYou will receive a message from me letting you know that you'll be matched the next day. To turn your warning exceptions off, type in the following command: **UPDATE WARNINGS False**`
    },
    STATUS_WARNINGS_OFF: {
      template: `Your warning notifications  are turned *OFF*. \n\nYou will not receive warnings the night before matches are made. `
    },
    STATUS_PREVIOUS_MATCHES: {
      reqVars: ['prevMatches'],
      template: `These are your previous matches:
      ${vars.prevMatches}`
    },
    STATUS_FALLBACK: {
      reqVars: ['email'],
      template: `The email of the current fallback user is: "${vars.email}".`
    },
    STATUS_FALLBACK_NULL: {
      template: `The fallback user is not set!`
    },

    ////////////////////////
    // Messages related to UPDATE actions
    ////////////////////////
    UPDATED_GENERAL: {
      reqVars: ['setting_key', 'setting_value'],
      template: `✅ successful update. \n *${
        vars.setting_key
      }* is now set to: *${vars.setting_value}*`
    },
    UPDATED_DAYS: {
      // reqVars: ['coffeeDays'],
      // template: `UPDATED your coffee chat days. \nYou will meet on the following days: ${
      //   vars.coffeeDays
      // }`
      template: `✅ UPDATED your coffee chat days`
    },
    UPDATED_FALLBACK: {
      reqVars: ['email', 'full_name'],
      template: `✅ UPDATED the fallback user. \nCurrent fallback user email is set to:  ${
        vars.email
      }`
    },
    ////////////////////////
    // MATCHED Related Messages
    ////////////////////////
    YOUR_MATCH: {
      reqVars: ['full_name'],
      template: `Hi there! 👋
      You've been matched today with @**${vars.full_name}**
      See [${
        vars.full_name
      }'s profile](https://www.recurse.com/directory?q=${encodeURIComponent(
        vars.full_name
      )}) for more details. Hope you have a wonderful chat!`
    },
    ////////////////////////
    // HELP messages
    ////////////////////////
    HELP: {
      template: `Hi! I'm a  🤖  that likes to pair Recursers up for chats. Here are some simple commands you can use to communicate with me:
      * \`\`\`show days\`\`\` -- tells you what days you'll be matching on (by default its Mon, Tue, Wed, Thu)
      * \`\`\`update days [mon tue wed ...]\`\`\` -- updates the days you will match on. Use the first three letters of the weekday
      * \`\`\`skip\`\`\` -- skips your next planned matching day
      * \`\`\`deactivate\`\`\`\ -- freezes your account, you will no longer receive matches
      See more @[wiki](${process.env.GITHUB_URL}/wiki/)
      `
    },
    HELP_SHOW: {
      template: `Here are the valid subcommands associated with the **SHOW** directive:
     * \`\`\`SHOW DAYS\`\`\`  - shows you what days you are currently signed up to be matched on
     * \`\`\`SHOW SKIP\`\`\` - shows you whether you will be skipping your next match or not
     * \`\`\`SHOW WARNINGS\`\`\` - shows whether you'll receive warning notifications the night before you get matched or not
      `
    },
    HELP_UPDATE: {
      template: `Here are the valid subcommands associated with the **UPDATE** directive. Valid arguments for each command are listed in the square braces:
     * \`\`\`UPDATE DAYS [mon tue wed thu fri sat sun]\`\`\`
     * \`\`\`UPDATE SKIP [0, 1]\`\`\`
     * \`\`\`UPDATE WARNINGS [0, 1]\`\`\`
      `
    },
    ////////////////////////
    // BOT related messages
    ////////////////////////
    BOT_ISSUES_NONE: {
      template: `☕️ bot is doing great! 🎉 I am flawless, don't even have a single issue!`
    },
    BOT_ISSUES_FEW: {
      reqVars: ['num_issues'],
      template: `☕️ bot is doing alright. I've got ${
        vars.num_issues
      } issue(s). You can make me happy by fixing my issues. See more at [issues](${
        process.env.GITHUB_URL
      }/issues)`
    },
    BOT_ISSUES_MANY: {
      template: `☕️ bot isn't doing great. I've got a lot of issues 😞. Precisely ${
        vars.num_issues
      } issues, but who's even counting... But that's alright because I know that you care and you can make me better one issue at a time. Learn more at [issues](${
        process.env.GITHUB_URL
      }/issues)`
    },
    BOT_STATS: {
      reqVars: ['num_matches'],
      template: `Coffee chat has made \`${
        vars.num_matches
      }\` matches to date. That's a lot of ☕️ 📊 🤗`
    },
    BOT_USERS: {
      reqVars: ['num_active'],
      template: `There are ${vars.num_active} active users right now. 📊`
    },
    ////////////////////////
    // Blank Message
    ////////////////////////
    BLANK: {
      reqVars: ['message'],
      template: `${vars.message}`
    },
    ////////////////////////
    // Warning Messages (cron)
    ////////////////////////
    // TODO: DEPRECATION PENDING
    TODAYS_MATCH: {
      reqVars: ['full_name', 'first_name'],
      template: `Hi there! 👋
      You've been matched today with @**${vars.full_name}**
      See [${
        vars.first_name
      }'s profile](https://www.recurse.com/directory?q=${encodeURIComponent(
        vars.full_name
      )}) for more details.`
    },

    WARNING_NOTIFICATION: {
      template: `Hi there 👋\nJust a friendly reminder that you'll be matched for coffee chats tomorrow.
      If you would like to cancel tomorrow's match, just type: \`\`\`skip\`\`\` or \`\`\`cancel\`\`\`
      If you would no longer wish to receive these warnings messages, you can update your warning settings by typing:  \`\`\`UPDATE WARNINGS OFF\`\`\``
    },

    ////////////////////////
    // Error Messages
    ////////////////////////
    ERROR: {
      template: `Ooops ... \n ${vars.errorMessage}
      \nIf you think this is a 🐞, please submit an issue @ [issues](${
        process.env.GITHUB_URL
      }/issues)
      `,
      reqVars: ['errorMessage']
    },

    ////////////////////////
    // One-off Messages
    ////////////////////////
    ONBOARDING: {
      template: `👋 Hi there, I'm Chat Bot. \nI like to pair up RC community members for one-on-one chats. It's often nice to take a break during the day to chat with other Recursers like yourself! \nIf you're interested, just type: \`\`\`signup\`\`\` to start getting paired tomorrow or \`\`\`activate\`\`\` if you're a returning user.

      Learn more at my [wiki](${process.env.GITHUB_URL}/wiki)`
    },
    OFFBOARDING: {
      template: `It's the end of the batch and we're 😢 to see you go~ \nYour account has automatically been deactivated, so you will no longer receive matches from me. But if you're in the area and would like to meet and chat with other recursers again just type: \`\`\`ACTIVATE\`\`\`\ any time. ✌️`
    }
  };

  return msgCreaterMap[messageType].template;
}
