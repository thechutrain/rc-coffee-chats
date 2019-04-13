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

  // TODO: why is ts giving me this error?
  // @ts-ignore
  return axios({
    method: 'post',
    baseURL: process.env.ZULIP_URL_ENDPOINT,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: process.env.ZULIP_BOT_USERNAME,
      password: process.env.ZULIP_BOT_API_KEY
    },
    data: dataAsQueryParams
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
    PROMPT_SIGNUP: {
      template: `Hello there! I'm :coffee: bot!
      You are not currently registered as a user of coffee chats
      Type SIGNUP to join`
    },
    SIGNED_UP: {
      template: `You've successfully been added to coffee chat!
      Type HELP or learn more at [github.com/thechutrain/rc-coffee-chats](https://github.com/thechutrain/rc-coffee-chats)`
    },
    SHOW_DAYS: {
      reqVars: ['coffeeDays'],
      template: `You are currently set to have coffee chats on the following days: ${
        vars.coffeeDays
      }`
    },
    UPDATED_DAYS: {
      // reqVars: ['coffeeDays'],
      // template: `UPDATED your coffee chat days. \nYou will meet on the following days: ${
      //   vars.coffeeDays
      // }`
      template: `UPDATED your coffee chat days ✅`
    },
    HELP: {
      template: `Hi! I'm :coffee: bot and I'm here to help!
      To talk to me, enter a valid command that begins with the following:
      \`\`\`SHOW | UPDATE | HELP\`\`\`
      I'm also open-sourced, so you can help contribute and make me better :smile:
      You can see find my inner workings @ [github](${
        process.env.HELP_URL
      }) or post an issue @ [issues](${process.env.GITHUB_URL}/issues)
      `
    },
    ERROR: {
      template: `Error! 💣 \n ${vars.errorMessage}
      \n if this is a 🐞, please submit an issue @ [issues](${
        process.env.GITHUB_URL
      }/issues)
      `,
      reqVars: ['errorMessage']
    }
  };

  return msgCreaterMap[messageType].template;
}
