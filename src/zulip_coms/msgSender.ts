/**
 * This module is responsible for sending messages to end user
 * sent from our server --> bot/zulip server
 */

import axios from 'axios';
import { ICliAction } from './cli.interface';

// TODO: make a sendMessage (takes in message type etc.)
export enum messageTypeEnum {
  'PROMPT_SIGNUP',
  'SIGNUP',

  // CLI Update-related cmds
  'UPDATE_DAYS',
  'UPDATE_SKIP',
  'UPDATE_WARNINGS',

  // CLI Get-related cmds
  'STATUS_DAYS',
  'STATUS_SKIP',
  'STATUS_WARNINGS',

  // HELP
  'HELP_UPDATE',
  'HELP_STATUS',
  'HELP'
}
export enum MsgStatus {
  OK,
  ERROR
}
export interface IMsgSenderArgs {
  // status: 'OK' | 'ERROR';
  status: MsgStatus;
  messageType: messageTypeEnum;
  payload?: any;
  message?: string;
  cliAction?: ICliAction;
}

export function zulipMsgSender(
  toEmail: string | string[],
  msgOpt: IMsgSenderArgs
): void {
  let messageContent;
  console.log('=========== ZulipMsgSender ==========');
  console.log(msgOpt);

  if (msgOpt.status === MsgStatus.ERROR) {
    messageContent = `Sorry there was an error handling your request. If this is a bug, please submit an issue @  [${
      process.env.GITHUB_URL
    }](${process.env.GITHUB_URL})
    ------ given request --------
    payload: ${msgOpt.payload}
    message: ${msgOpt.message}
    cli: ${JSON.stringify(msgOpt.cliAction)}
    `;
  } else {
    switch (msgOpt.messageType) {
      ////////////////////////
      // Messages related to non-signed up users
      ////////////////////////
      case messageTypeEnum.PROMPT_SIGNUP:
        messageContent = `Hello there! I'm :coffee: bot!
        You are not currently registered as a user of coffee chats
        Type SIGNUP to join`;
        break;

      case messageTypeEnum.SIGNUP:
        messageContent = `You've successfully been added to coffee chat!
          Type HELP or learn more at [github.com/thechutrain/rc-coffee-chats](https://github.com/thechutrain/rc-coffee-chats)`;

        break;

      ////////////////////////
      // CHANGE messages
      ////////////////////////
      case messageTypeEnum.UPDATE_DAYS:
        messageContent = `You have successfully updated your coffee chat days.`;
        break;

      case messageTypeEnum.UPDATE_WARNINGS:
        const warningsOnOff = msgOpt.payload.warning_exception ? 'ON' : 'OFF';
        messageContent = `You've successfully updated your warning settings.
          warnings exceptions are set to be ${warningsOnOff}`;

        break;

      case messageTypeEnum.UPDATE_SKIP:
        const skipping = msgOpt.payload.skip_next_match ? ' NOT' : '';
        messageContent = `You've successfully updated your "skip_next_match" settings. 
          
          You will${skipping} be skipping your next match.`;
        break;

      ////////////////////////
      // STATUS messages
      ////////////////////////
      case messageTypeEnum.STATUS_DAYS:
        const daysAsString = msgOpt.payload.coffeeDays.join(' ');
        messageContent = `You are currently set to have coffee chats on the following days: ${daysAsString}`;
        break;

      case messageTypeEnum.STATUS_WARNINGS:
        // TODO: handle errors?
        const warningsText = msgOpt.payload.warningException ? 'ON' : 'OFF';
        // const willOrWillNot = msgOpt.payload.warningException ? 'WILL' : 'WILL NOT'
        messageContent = `Your reminder warnings are currently set to be: ${warningsText}`;
        break;

      case messageTypeEnum.STATUS_SKIP:
        const { skipNext } = msgOpt.payload;
        messageContent = `You will ${
          skipNext ? '' : 'NOT'
        } be skipping your next match. `;
        break;

      ////////////////////////
      // HELP messages
      ////////////////////////
      case messageTypeEnum.HELP_UPDATE:
        messageContent = `Valid **update** commands:
        UPDATE <DAYS | SKIP | WARNINGS> [... list of args]
        * <DAYS> - [MON, TUE, WED, THU, FRI, SAT, SUN]
          --> update the days that you plan on having coffee chats
        * <SKIP> - TRUE | FALSE
          --> skip your next match
        * <WARNINGS> - TRUE | FALSE
          --> updates whether you will receive warnings the night before about skipping your match or not
        * <ACTIVE> - TRUE | FALSE
          --> updates whether you are active on coffee chats or not
        See more @ [docs](${process.env.HELP_URL})
        `;
        break;

      case messageTypeEnum.HELP_STATUS:
        messageContent = `Valid **status** commands: 
        STATUS <DAYS | SKIP | WARNINGS> [... list of optional args]
        * <DAYS>
          --> returns the days that you are signed up for
        * <SKIP>
          --> returns boolean of whether you will skip your next match or not
        * <WARNINGS>
          --> returns boolean of whether you will get warnings or not 
        See more @ [docs](${process.env.HELP_URL})`;
        break;

      case messageTypeEnum.HELP:
        messageContent = `Hi! I'm :coffee: bot and I'm here to help! 
        To talk to me, enter a valid command that begins with the following: 
        \`\`\`UPDATE | STATUS | HELP\`\`\`
        I'm also open-sourced, so you can help contribute and make me better :smile:
        You can see find my inner workings @ [github](${
          process.env.HELP_URL
        }) or post an issue @ [issues](${process.env.GITHUB_URL}/issues)
        `;
        break;

      default:
        messageContent = `DEFAULT OK MSG:  
          payload: ${msgOpt.payload}
          message: ${msgOpt.message}
          cli: ${JSON.stringify(msgOpt.cliAction)}
          `;
        break;
    }
  }

  sendGenericMessage(toEmail, messageContent);
}

export function sendGenericMessage(
  toEmail: string | string[],
  messageContent: string
) {
  // example: link See [${matchedName.split(" ")[0]}'s profile](https://www.recurse.com/directory?q=${encodeURIComponent(matchedName)})
  // const testMessage = `Hi you're @**Alan Chu (W1\'18)** my name is *coffee-bot*`;
  const rawData = {
    type: 'private',
    to: toEmail instanceof Array ? toEmail.join(', ') : toEmail,
    content: encodeURIComponent(messageContent)
  };

  const dataAsQueryParams = Object.keys(rawData)
    .map(key => `${key}=${rawData[key]}`)
    .join('&');

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

// function createMsgContent(msgType) {
//   const strVars = {
//     foo: 'bar'
//   };
//   const MESSAGE_TEMPLATES = {
//     [messageTypeEnum.PROMPT_SIGNUP]: `I am a variable ${
//       strVars.foo
//     } You are not currently signed up as a user of coffee chats Type SIGNUP to join`
//   };
//   return MESSAGE_TEMPLATES[msgType];
// }
