/**
 * This module is responsible for sending messages to end user
 * sent from our server --> bot/zulip server
 */

// import * as zulip from 'zulip-js';
const zulip = require('zulip-js');
import { IZulipConfig } from './interface';
import axios from 'axios';

export function sendMessage(toEmail: string, messageContent: string) {
  const dataString = `type=private\nto=alancodes@gmail.com\ncontent=hellothere`;
  const prevData = {
    type: 'private',
    to: 'alancodes@gmail.com',
    content: 'sending message via axios'
  };

  // Version 1
  // return axios({
  //   method: 'post',
  //   baseURL: 'https://recurse.zulipchat.com/api/v1/messages',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   auth: {
  //     username: process.env.ZULIP_USERNAME,
  //     password: process.env.ZULIP_API_KEY
  //   },
  //   data: prevData
  // });

  return axios.post('https://recurse.zulipchat.com/api/v1/messages', prevData, {
    headers: {
      'Content-Type': 'application/json'
    },
    auth: {
      username: process.env.ZULIP_USERNAME,
      password: process.env.ZULIP_API_KEY
    }
  });
}

// TODO: this doesn't need to be async or a promise
// export function initZulipMessenger(
//   zulipConfig: IZulipConfig = {}
// ): {
//   sendMessage: (toEmail: string | string[], messageContent) => Promise<any>;
// } {
//   // const config = {
//   //   username: zulipConfig.ZULIP_USERNAME || process.env.ZULIP_USERNAME,
//   //   apiKey: zulipConfig.ZULIP_API_KEY || process.env.ZULIP_API_KEY,
//   //   realm: zulipConfig.ZULIP_REALM || process.env.ZULIP_REALM
//   // };

//   const zulipAPI = zulip({
//     username: process.env.ZULIP_USERNAME,
//     apiKey: process.env.ZULIP_API_KEY,
//     realm: process.env.ZULIP_REALM
//   });

//   // Send a message to a given Zulip user
//   function sendMessage(toEmail: string, messageContent: string);
//   function sendMessage(toEmail: string[], messageContent: string);
//   function sendMessage(
//     toEmail: string | string[],
//     messageContent: string
//   ): Promise<any> {
//     const emails = toEmail instanceof Array ? toEmail.join(', ') : toEmail;

//     return zulipAPI.messages.send({
//       to: emails,
//       type: 'private',
//       content: messageContent
//     });
//   }

//   /////////////////
//   /// Methods I am exposing
//   /////////////////
//   return {
//     sendMessage
//   };
// }
