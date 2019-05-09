import express from 'express';
import bodyParser from 'body-parser';
import moment from 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();
const PORT = process.env.PORT || 8080;

// ===== My Custom Modules =====
import * as types from './types';
import { initDB } from './db';
// import { parseStrAsBool, validatePayload } from './utils/';

//////////////////////////////////
/// Database
//////////////////////////////////
const db = initDB();

/////////////////
/// Middleware
/////////////////
import { initRegisteredHandler } from './middleware/registered-handler';
import { actionCreater } from './middleware/action-creater';
import { initActionHandler } from './middleware/action-handler';
import { messageHandler } from './middleware/message-handler';

const registerHandler = initRegisteredHandler(db);
const actionHandler = initActionHandler(db);

/////////////////
/// Server
/////////////////
const app = express();

app.use((req: types.ILocalsReq, res, next) => {
  req.local = {
    errors: []
  };
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'hello there!' });
});

// Handle messages received from Zulip outgoing webhooks
app.post(
  '/webhooks/zulip',
  bodyParser.json(),
  registerHandler,
  // parserHandler,
  actionCreater,
  actionHandler,
  messageHandler,
  (req: types.IZulipRequest, res) => {
    const currTime = moment()
      .tz('America/New_York')
      .format('L hh:mm:ss A');

    console.log(`\n======= START of Zulip Request =======`);
    console.log('>> current time: ', currTime);
    console.log('>> data: ', req.body.data);
    console.log('>> sender: ', req.body.message.sender_full_name);
    console.log(req.local.action);
    console.log('msg info', req.local.msgInfo);
    console.log('errors: ', req.local.errors);
    console.log(res.body);
    res.json({});
  }
);

// listen for requests :)
app.listen(PORT, () => {
  console.log(`🌍 is listening on port: ${PORT}`);
});
