import * as path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import logger from './logger';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from './db';
import { parseZulipServerRequest } from './zulip_coms/cliParser';
import {
  messageTypeEnum,
  zulipMsgSender,
  sendGenericMessage,
  IMsgSenderArgs
} from './zulip_coms/msgSender';
import { parseTruthy, validatePayload } from './utils/';

import { directives, ICliAction, subCommands } from './zulip_coms/interface';
import { ISqlOk, ISqlError } from './db/db.interface';
import { WEEKDAYS } from './constants';

// TODO: pass in env vars into the IFFE?
(async () => {
  const PORT = process.env.PORT || 3000;

  /////////////////
  /// Database
  /////////////////
  const db = (() => {
    const isProd = process.env.NODE_ENV === 'production';
    const DB_FILE = isProd ? 'prod.db' : 'dev.db';
    const fileMustExist = isProd;
    const DB_PATH = path.join(__dirname, '../', 'data/', DB_FILE);

    return initDB(DB_PATH, fileMustExist);
  })();

  /////////////////
  /// Server
  /////////////////
  const app = express();

  // Handle messages received from Zulip outgoing webhooks
  app.post('/webhooks/zulip', bodyParser.json(), (req, res) => {
    res.json({});

    const senderEmail = req.body.message.sender_email;
    let sqlResult: ISqlOk | ISqlError;
    let messageType: messageTypeEnum;

    ////////////////////////////////////////////////////
    // CHECK IF VALID USER / IF THEY ARE SIGNED UP
    /////////////////////////////////////////////////////
    // TODO: move to middleware eventually?
    const userExists = db.user.find(senderEmail);
    if (!userExists) {
      // TODO: check if the first word in message is signup!
      const wantsToSignUp = req.body.data.match(/signup/gi);

      if (wantsToSignUp) {
        sqlResult = db.user.add({
          email: senderEmail,
          full_name: req.body.message.sender_full_name
        });

        zulipMsgSender(senderEmail, {
          status: sqlResult.status,
          messageType: messageTypeEnum.SIGNUP
        });
      } else {
        zulipMsgSender(senderEmail, {
          status: 'OK',
          messageType: messageTypeEnum.PROMPT_SIGNUP
        });
      }

      return;
    }

    ////////////////////////////////////////////////////
    // Parse ZULIP Message
    /////////////////////////////////////////////////////
    // TODO: modify parseZulipServerRequest --> make it a middleware
    let cliAction: ICliAction;
    try {
      cliAction = parseZulipServerRequest(req.body);
    } catch (e) {
      // TODO: update this to use zulipMsgSender
      sendGenericMessage(senderEmail, e.message);
      console.log(e);
      return;
    }

    ////////////////////////////////////////////////////
    // Dispatch Action off Zulip CMD
    /////////////////////////////////////////////////////
    console.log('==== Received Valid cliAction =====');
    console.log(cliAction);

    if (
      cliAction.directive === directives.CHANGE ||
      cliAction.directive === directives.UPDATE
    ) {
      /////////////////////////////////////
      // CHANGE subcommand switch block
      /////////////////////////////////////
      switch (cliAction.subCommand) {
        case subCommands.DAYS:
        case subCommands.DATES:
          sqlResult = db.user.updateCoffeeDays(senderEmail, cliAction.payload);
          messageType = messageTypeEnum.UPDATE_DAYS;
          break;

        case subCommands.SKIP:
          messageType = messageTypeEnum.UPDATE_SKIP;
          try {
            validatePayload(cliAction.payload);
            const parsedTruthyVal = parseTruthy(cliAction.payload[0]);

            sqlResult = db.user.updateSkipNextMatch(
              senderEmail,
              parsedTruthyVal
            );
          } catch (e) {
            sendGenericMessage(senderEmail, e);
            return;
          }
          break;

        case subCommands.WARNINGS:
          messageType = messageTypeEnum.UPDATE_WARNINGS;
          try {
            validatePayload(cliAction.payload);
            const parsedTruthyVal = parseTruthy(cliAction.payload[0]);

            sqlResult = db.user.updateWarningException(
              senderEmail,
              parsedTruthyVal
            );
          } catch (e) {
            sendGenericMessage(senderEmail, e);
            return;
          }
          break;

        default:
          console.log(`No handler written for ${cliAction.subCommand}`);
          break;
      }
    } else if (cliAction.directive === directives.STATUS) {
      /////////////////////////////////////
      // STATUS subcommand switch block
      /////////////////////////////////////
      switch (cliAction.subCommand) {
        case subCommands.DATES:
        case subCommands.DAYS:
          console.log(`Status for my days`);
          sqlResult = db.user.getCoffeeDays(senderEmail);
          messageType = messageTypeEnum.STATUS_DAYS;
          break;

        case subCommands.WARNINGS:
          console.log('Status for whether warnings or on/off');
          sqlResult = db.user.getWarningStatus(senderEmail);
          messageType = messageTypeEnum.STATUS_WARNINGS;

          break;

        case subCommands.SKIP:
          console.log(
            `Status for whether youre going to SKIP next match or not`
          );
          // TODO: Feature, be cool to determine when you're next match is.
          sqlResult = db.user.getNextStatus(senderEmail);
          messageType = messageTypeEnum.STATUS_SKIP;

          break;
        // case subCommands.MATCH:
        //   console.log(`Status for who your match is today`);
        //   break;

        default:
          console.log(`No handler writtern for ${cliAction.subCommand}`);
          break;
      }
    } else {
      /////////////////////////////////////
      // HELP subcommand switch block
      /////////////////////////////////////
      // TODO: send back message for Help, or additional commands:
    }

    // ====== Zulip Message ==========
    const zulipMsgOpts: IMsgSenderArgs = {
      messageType,
      status: sqlResult.status,
      payload: sqlResult.payload,
      message: sqlResult.message,
      cliAction
    };
    zulipMsgSender(senderEmail, { ...zulipMsgOpts, cliAction });
  });

  app.post('/cron/run', (request, response) => {
    // logger.info('Running the matcher and sending out matches');
    if (request.headers.secret === process.env.RUN_SECRET) {
      console.log('Run the main function here');
    }
    response.status(200).json({ status: 'ok' });
  });

  //////////////////////////
  // TESTING DATABASE ACCESS
  //////////////////////////
  // app.get('/user/add/:name', (request, response) => {
  //   logger.info('received /user/add/:name');
  //   const { status } = user.add({
  //     email: `${request.params.name}`,
  //     full_name: 'test name'
  //   });
  //   response.send(status);
  // });

  // app.get('/user/find/:name', (request, response) => {
  //   logger.info('received /user/find');
  //   console.log(request.params.name);
  //   const { payload } = user.find(`${request.params.name}`);
  //   response.json(payload);
  // });

  // app.post('/cron/run/warnings', (request, response) => {
  //   // logger.info('Sending warning messages about tomorrow matches');
  //   if (request.headers.secret === process.env.RUN_SECRET) {
  //     console.log('run warning messages here');
  //     // runWarningMessages();
  //   }
  //   response.status(200).json({ status: 'ok' });
  // });

  // listen for requests :)
  app.listen(PORT, () => {
    console.log(`🌍 is listening on port: ${PORT}`);
  });
})();
