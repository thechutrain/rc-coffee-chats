import express from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv-safe';
dotenv.config();
const PORT = process.env.PORT || 8080;

// ===== My Custom Modules =====
import * as types from './types';
import { initDB } from './olddb';
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
    console.log(res.body);
    res.json({});
  }
);

// listen for requests :)
app.listen(PORT, () => {
  console.log(`🌍 is listening on port: ${PORT}`);
});
