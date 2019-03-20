/**
 * middleware for checking if there is a msg & sending it
 */
import axios from 'axios';
import * as types from '../types';

export function sendMessageHandler(req: types.IZulipRequest, res, next) {
  console.log(`======== send message handler ===========`);
  const { currentUser } = req.local.cli;
  const { errors } = req.local;

  // Case: handle error messages
  if (errors.length) {
    errors.forEach(err => {
      const messageContent = err.customMessage
        ? `ERROR: ${err.customMessage}`
        : `Error`;
      console.log('there was an error, sending error message ....');
      sendMessage(currentUser, messageContent);
    });
    // next();
    res.json({});
    return;
  }

  // Case: given a msgType
  // TEMP:
  const msg = JSON.stringify(req.local.msgInfo);
  sendMessage(currentUser, `Req.local.msgInfo: ${msg}`);
  next();
}

/** ========= sends a zulip message ========
 *
 * @param toEmail
 * @param messageContent
 */
export function sendMessage(
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
