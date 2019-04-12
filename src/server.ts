import * as path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv-safe';
dotenv.config();
const PORT = process.env.PORT || 8080;

// ===== My Custom Modules =====
import * as types from './types';
// import { initDB } from './db';
// import { parseStrAsBool, validatePayload } from './utils/';

//////////////////////////////////
// Messaging Services
//////////////////////////////////
// import { templateMessageSender } from './zulip-messenger/msg-sender';

//////////////////////////////////
/// Database
//////////////////////////////////
// const db = (() => {
//   const isProd = process.env.NODE_ENV === 'production';
//   const DB_FILE = isProd ? 'prod.db' : 'dev.db';
//   const fileMustExist = isProd;
//   const DB_PATH = path.join(__dirname, '../', 'data/', DB_FILE);

//   return initDB(DB_PATH, fileMustExist);
// })();

/////////////////
/// Middleware
/////////////////
// import { initRegisteredHandler } from './middleware/registered-handler';
// import { parserHandler } from './middleware/parser-handler';
// import { actionCreater } from './middleware/action-creater';
// import { initActionHandler } from './middleware/action-handler';
// import { messageHandler } from './middleware/message-handler';

// const registerHandler = initRegisteredHandler(db);
// const actionHandler = initActionHandler({ db });

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
  res.json({ message: 'hello there' });
});
// Handle messages received from Zulip outgoing webhooks
app.post(
  '/webhooks/zulip',
  bodyParser.json(),
  // registerHandler,
  // parserHandler,
  // actionCreater,
  // actionHandler,
  // messageHandler,
  // (req: types.IZulipRequest, res) => {
  (req, res) => {
    res.json({});

    // TODO: extend Express.Request type, so that I can store
    // user info on the req object
    // const senderEmail = req.body.message.sender_email;

    // let sqlResult: ISqlOk | ISqlError;
    // let messageType: msgType;
    // const messageOverloadArgs = {};

    // ////////////////////////////////////////////////////
    // // Parse ZULIP Message
    // /////////////////////////////////////////////////////
    // // TODO: modify parseZulipServerRequest --> make it a middleware

    // // const cliAction = {directive: };
    // // try {
    // //   cliAction = parseZulipServerRequest(req.body);
    // // } catch (e) {
    // //   // TODO: update this to use zulipMsgSender
    // //   sendGenericMessage(senderEmail, e.message);
    // //   console.log(e.message);
    // //   return;
    // // }

    // ////////////////////////////////////////////////////
    // // Dispatch Action off Zulip CMD
    // /////////////////////////////////////////////////////
    // console.log('\n==== Received Valid cliAction =====');
    // console.log(cliAction);

    // /////////////////////////////////////
    // // CHANGE/UPDATE
    // /////////////////////////////////////
    // if (
    //   cliAction.directive === directives.CHANGE ||
    //   cliAction.directive === directives.UPDATE
    // ) {
    //   switch (cliAction.subCommand) {
    //     case UpdateSubCommands.DAYS:
    //     case UpdateSubCommands.DATES:
    //       sqlResult = db.user.updateCoffeeDays(senderEmail, cliAction.payload);
    //       messageType = msgType.UPDATED_DAYS;
    //       break;

    //     case UpdateSubCommands.SKIP:
    //       messageType = msgType.UPDATED_SKIP;
    //       try {
    //         validatePayload(cliAction.payload);
    //         const parsedBooleanVal = parseStrAsBool(cliAction.payload[0]);

    //         sqlResult = db.user.updateSkipNextMatch(
    //           senderEmail,
    //           parsedBooleanVal
    //         );
    //       } catch (e) {
    //         sendGenericMessage(senderEmail, e);
    //         return;
    //       }
    //       break;

    //     case UpdateSubCommands.WARNINGS:
    //       messageType = msgType.UPDATED_WARNINGS;
    //       try {
    //         validatePayload(cliAction.payload);
    //         const parsedBooleanVal = parseStrAsBool(cliAction.payload[0]);

    //         sqlResult = db.user.updateWarningException(
    //           senderEmail,
    //           parsedBooleanVal
    //         );
    //       } catch (e) {
    //         sendGenericMessage(senderEmail, e);
    //         return;
    //       }
    //       break;

    //     default:
    //       messageType = msgType.HELP_UPDATE;
    //       break;
    //   }
    // } else if (cliAction.directive === directives.STATUS) {
    //   /////////////////////////////////////
    //   // STATUS
    //   /////////////////////////////////////
    //   switch (cliAction.subCommand) {
    //     case StatusSubCommands.DATES:
    //     case StatusSubCommands.DAYS:
    //       sqlResult = db.user.getCoffeeDays(senderEmail);
    //       messageType = msgType.STATUS_DAYS;
    //       break;

    //     case StatusSubCommands.WARNINGS:
    //       sqlResult = db.user.getWarningStatus(senderEmail);
    //       messageType = msgType.STATUS_WARNINGS;
    //       break;

    //     case StatusSubCommands.SKIP:
    //       sqlResult = db.user.getNextStatus(senderEmail);
    //       messageType = msgType.STATUS_SKIP;
    //       break;

    //     default:
    //       messageType = msgType.HELP_STATUS;
    //       break;
    //   }
    // } else if (cliAction.directive === directives.HELP) {
    //   /////////////////////////////////////
    //   // HELP subcommand switch block
    //   /////////////////////////////////////
    //   switch (cliAction.subCommand) {
    //     case HelpSubCommands.UPDATE:
    //       messageType = msgType.HELP_UPDATE;
    //       break;
    //     case HelpSubCommands.STATUS:
    //       messageType = msgType.HELP_STATUS;
    //       break;
    //     default:
    //       messageType = msgType.HELP;
    //       break;
    //   }
    // }

    // ====== Zulip Message ==========
    // const zulipMsgOpts: IMsgSenderArgs = {
    //   messageType,
    //   // status: sqlResult ? sqlResult.status : 'OK',
    //   status: sqlResult.status === 'OK' ? MsgStatus.OK : MsgStatus.ERROR,
    //   payload: sqlResult ? sqlResult.payload : null,
    //   message: sqlResult ? sqlResult.message : null,
    //   cliAction
    // };
    // zulipMsgSender(senderEmail, messageType, messageOverloadArgs);
  }
);

// app.get('/test', (req, res) => {
//   res.send('hi');
//   zulipMsgSender('alancodes@gmail.com', msgType.HELP, {});
// });

// listen for requests :)
app.listen(PORT, () => {
  console.log(`🌍 is listening on port: ${PORT}`);
});
