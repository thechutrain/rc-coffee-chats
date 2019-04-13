import * as path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
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
const db = (() => {
  const isProd = process.env.NODE_ENV === 'production';
  const fileMustExist = isProd;
  const DB_FILE = (isProd ? process.env.PROD_DB : process.env.DEV_DB) as string;
  const DB_PATH = path.join(__dirname, '../', 'data/', DB_FILE);

  return initDB(DB_PATH, fileMustExist);
})();

/////////////////
/// Middleware
/////////////////
import { initRegisteredHandler } from './middleware/registered-handler';
import { parserHandler } from './middleware/parser-handler';
import { actionCreater } from './middleware/action-creater';
import { initActionHandler } from './middleware/action-handler';
import { messageHandler } from './middleware/message-handler';

const registerHandler = initRegisteredHandler(db);
const actionHandler = initActionHandler(db);

/////////////////
/// Server
/////////////////
const app = express();

app.get('/', (req, res) => {
  res.send('Im working');
});

app.use((req: types.ILocalsReq, res, next) => {
  req.local = {
    errors: []
  };
  next();
});

// Handle messages received from Zulip outgoing webhooks
app.post(
  '/webhooks/zulip',
  bodyParser.json(),
  registerHandler,
  parserHandler,
  actionCreater,
  actionHandler,
  messageHandler,
  (req: types.IZulipRequest, res) => {
    res.json({});
  }
);

// listen for requests :)
app.listen(PORT, () => {
  console.log(`🌍 is listening on port: ${PORT}`);
});
