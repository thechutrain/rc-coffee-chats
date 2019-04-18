/**
 * This module is responsible for sending messages to end user
 * sent from our server --> bot/zulip server
 */

import axios from 'axios';
import * as types from '../types';

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
  messageType: types.msgTemplate,
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
  messageType: types.msgTemplate,
  overloadArgs = {}
): string {
  const vars: any = overloadArgs;

  // TODO: validate that all vars exist on overloadArgs!

  const msgCreaterMap: types.msgCreaterMap = {
    ////////////////////////
    // Registration related messages
    ////////////////////////
    PROMPT_SIGNUP: {
      template: `Hello there! I'm the new :coffee: bot!
      You are not currently registered as a user of coffee chats.
      If you would like to join, just type: **SIGNUP**`
    },
    SIGNED_UP: {
      template: `You've successfully been added to coffee chat! 🤠
      You can learn more at [github.com/thechutrain/rc-coffee-chats](https://github.com/thechutrain/rc-coffee-chats)
      or just type: **HELP**`
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
    STATUS_SKIP_TRUE: {
      template: `Your *skip next match* is set to *True*. \n\nYou will be skipping your next match`
    },
    STATUS_SKIP_FALSE: {
      template: `Your *skip next match* is set to *False*.\n\n You will be matched according to your regular schedule.`
    },
    STATUS_WARNINGS_ON: {
      template: `Your warning settings are turned *ON*. \n\nYou will receive a message from me letting you know that you'll be matched the next day. To turn the warnings off type in the following command: **UPDATE WARNINGS False**`
    },
    STATUS_WARNINGS_OFF: {
      template: `Your warning settings are turned *OFF*. \n\nYou will no longer get warnings the night before matches are made. `
    },

    ////////////////////////
    // Messages related to UPDATE actions
    ////////////////////////
    UPDATED_GENERAL: {
      reqVars: ['setting_key', 'setting_value'],
      template: `✅ successful update. \n Your *${
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
      template: `Hi! I'm :coffee: bot and I'm here to help!
      To talk to me, enter a valid command that begins with the following:
      \`\`\`SHOW | UPDATE | HELP\`\`\`

      To learn more about the **SHOW** or **UPDATE** commands, you can type:
      **HELP SHOW** or **HELP UPDATE**

      I'm also open-sourced, so you can help contribute and make me better :smile:
      You can see find my inner workings @ [github](${
        process.env.HELP_URL
      }) or post an issue @ [issues](${process.env.GITHUB_URL}/issues)
      `
    },
    HELP_SHOW: {
      template: `Here are the valid subcommands associated with the **SHOW** directive:
     * \`\`\`SHOW DAYS\`\`\` 
     * \`\`\`SHOW SKIP\`\`\` 
     * \`\`\`SHOW WARNINGS\`\`\` 
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
    // Error Messages
    ////////////////////////
    ERROR: {
      template: `Ooops ... \n ${vars.errorMessage}
      \nIf you think this is a 🐞, please submit an issue @ [issues](${
        process.env.GITHUB_URL
      }/issues)
      `,
      reqVars: ['errorMessage']
    }
  };

  return msgCreaterMap[messageType].template;
}
