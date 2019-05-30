import express from 'express';
import bodyParser from 'body-parser';
import moment from 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();
const PORT = process.env.PORT || 8080;

// ===== My Custom Modules =====
import { initDB } from './db';

//////////////////////////////////
/// Database
//////////////////////////////////
const db = initDB();

/////////////////
/// Middleware
/////////////////
import { zulipTokenValidator } from './middleware/zulip-token-validator';
import { initRegisteredHandler } from './middleware/registered-handler';
import { actionCreater } from './middleware/action-creater';
import { initActionHandler } from './middleware/action-handler';
import { messageHandler } from './middleware/message-handler';
import {
  IBaseZulip,
  IZulipRequestWithMessage
} from './types/zulipRequestTypes';

const registerHandler = initRegisteredHandler(db);
const actionHandler = initActionHandler(db);

/////////////////
/// Server
/////////////////
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'hello there!' });
});

// Handle messages received from Zulip outgoing webhooks
app.post(
  '/webhooks/zulip',
  bodyParser.json(),
  (req, res, next) => {
    req.locals = {};
    next();
  },
  zulipTokenValidator,
  registerHandler,
  actionCreater,
  actionHandler,
  messageHandler,
  (req: IZulipRequestWithMessage, res) => {
    const currTime = moment()
      .tz('America/New_York')
      .format('L hh:mm:ss A');

    // NOTE: only log messages that are directly to chat bot
    if (req.body.message.display_recipient.length === 2) {
      console.log(`\n======= START of Zulip Request =======`);
      console.log('>> current time: ', currTime);
      console.log('>> data: ', req.body.data);
      console.log('>> sender: ', req.body.message.sender_full_name);
      console.log('ACTION:', req.locals.action);
      console.log('MSG:', req.locals.msg);
      console.log('ERRORS: ', req.locals.errors);
      console.log('\n');
    }
    res.json({});
  }
);

// listen for requests :)
app.listen(PORT, () => {
  console.log(`🌍 is listening on port: ${PORT}`);
});
