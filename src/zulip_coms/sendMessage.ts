/**
 * This module is responsible for sending messages to end user
 * sent from our server --> bot/zulip server
 */

import axios from 'axios';

export function sendMessage(toEmail: string, messageContent: string) {
  // const dataString = `type=private\nto=alancodes@gmail.com\ncontent=hellothere`;
  const data = {
    type: 'private',
    to: 'alancodes@gmail.com',
    content: 'sending message via axios'
  };

  const baseURL = 'https://recurse.zulipchat.com/api/v1/messages';

  return axios({
    method: 'post',
    baseURL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: process.env.ZULIP_USERNAME,
      password: process.env.ZULIP_API_KEY
    },
    data,
    transformRequest: [
      defaultData => {
        const dataQueryString = Object.keys(data)
          .map(key => `${key}=${defaultData.key}`)
          .join('&');
        return dataQueryString;
      }
    ]
  });
}

// export function sendMessage(
//   toEmail: string | string[],
//   messageContent: string
// ) {
//   const postBodyData = {
//     type: 'private',
//     // to: toEmail instanceof Array ? toEmail.join() : toEmail,
//     to: 'alancodes@gmail.com',
//     content: 'da faque' // Note: need to url encode?
//   };

//   // TODO: process the data here:
//   console.log(postBodyData);

//   // const url = 'https://recurse.zulipchat.com/api/v1/messages';
//   console.log(process.env.ZULIP_URL_ENDPOINT);

//   return axios({
//     method: 'post',
//     baseURL: process.env.ZULIP_URL_ENDPOINT, // NOTE: includes api/v1/messages
//     // baseURL: url,
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     auth: {
//       username: process.env.ZULIP_USERNAME,
//       password: process.env.ZULIP_API_KEY
//     },
//     data: postBodyData,
//     // NOTE: need to process data, to make it analogous to the curl -d
//     transformRequest: [
//       rawData => {
//         const dataQueryString = Object.keys(rawData)
//           .map(key => `${key}=${rawData[key]}`)
//           .join('&');
//         console.log(dataQueryString);

//         return dataQueryString;
//       }
//     ]
//   });
// }
