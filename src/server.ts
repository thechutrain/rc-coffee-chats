import * as path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import logger from './logger';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from './db';
import { parseZulipServerRequest } from './zulip_coms/cliParser';
import {
  messageType,
  zulipMsgSender,
  sendGenericMessage
} from './zulip_coms/msgSender';

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
    const senderEmail = req.body.message.sender_email;
    let zulipMsgHandler;
    // {
    //   // log?: boolean;
    //   // logData?: any;
    //   messageType?: 'ERROR' | 'OK'; // TODO: move to enum
    //   messageData: any;
    // };
    // Question: Do I even need to end the response?
    res.json({});

    ////////////////////////////////////////////////////
    // TODO: CHECK IF VALID USER / IF THEY ARE SIGNED UP
    /////////////////////////////////////////////////////
    // TODO: move to middleware
    const userExists = db.user.find(senderEmail);
    if (!userExists) {
      const { sender_full_name } = req.body.message;

      // TODO: ask user to type: SIGNUP to sign up to register.
      const { status } = db.user.add({
        email: senderEmail,
        full_name: sender_full_name
      });

      if (status === 'SUCCESS') {
        // TODO: Personalize this message with the full name!
        sendMessage(
          senderEmail,
          'Welcome new user, you have successfully been added to the coffee-chat club. Type HELP to learn more or visit this link'
        );
      } else {
        sendMessage(
          senderEmail,
          'Failed to sign you up, please contact the admin for more help.'
        );
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
      // TODO: add more to the error message: help for that subcommands?
      sendMessage(senderEmail, e.message);
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
          console.log(`Try to change days to: ${cliAction.payload}`);

          let { status, message, payload } = db.user.updateCoffeeDays(
            senderEmail,
            cliAction.payload
          );

          zulipMsgHandler = {
            status,
            messageType: 'UPDATE_DAYS',
            payload,
            message,
            cliAction
          };

          break;

        case subCommands.SKIP:
          console.log(`Will skip your next match: ${cliAction.payload}`);
          
          (() => {
            const {
              status,
              message,
              payload
            } = db.user.updateWarningExceptions(senderEmail);
            if (status === 'FAILURE') {
              zulipHandler = {
                messageType: 'ERROR',
                messageData: message
              };
            } else {
              // TODO: make this a util (convert string of int --> weekdays?)
              const daysAsString = payload.coffee_days
                .split('')
                .map(dayInt => WEEKDAYS[dayInt])
                .join(' ');
              zulipHandler = {
                messageType: 'OK',
                messageData: `Your coffee day(s) are: ${daysAsString}`
              };
            }
          })();
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
          try {
            const sqlResult = db.user.getCoffeeDays();
            zulipMsgHandler = {
              messageType: 'OK_GET_COFFEE_DAYS',
              data: sqlResult.payload
            };
          } catch (e) {
            zulipMsgHandler = {
              messageType: 'ERROR_MSG',
              errorMsg: e
            };
          }

          // (() => {
          //   const { status, message, payload } = db.user.findUserByEmail(
          //     senderEmail
          //   );
          //   if (status === 'FAILURE') {
          //     zulipHandler = {
          //       messageType: 'ERROR',
          //       messageData: message
          //     };
          //   } else {
          //     // TODO: make this a util (convert string of int --> weekdays?)
          //     const daysAsString = payload.coffee_days
          //       .split('')
          //       .map(dayInt => WEEKDAYS[dayInt])
          //       .join(' ');
          //     zulipHandler = {
          //       messageType: 'OK',
          //       messageData: `Your coffee day(s) are: ${daysAsString}`
          //     };
          //   }
          // })();
          break;
        case subCommands.WARNINGS:
          console.log('Status for whether warnings or on/off');
          (() => {
            const { status, message, payload } = db.user.findUserByEmail(
              senderEmail
            );
            if (status === 'FAILURE') {
              zulipHandler = {
                messageType: 'ERROR',
                messageData: message
              };
            } else {
              // TODO: make this a util (convert string of int --> weekdays?)
              const warningsText = payload.warning_exception ? 'ON' : 'OFF';
              zulipHandler = {
                messageType: 'OK',
                messageData: `Your warning exceptions are: ${warningsText}`
              };
            }
          })();
          break;
        case subCommands.SKIP:
          console.log(
            `Status for whether youre going to SKIP next match or not`
          );
          // TODO: Feature, be cool to determine when you're next match is.
          (() => {
            const { status, message, payload } = db.user.findUserByEmail(
              senderEmail
            );
            if (status === 'FAILURE') {
              zulipHandler = {
                messageType: 'ERROR',
                messageData: message
              };
            } else {
              // TODO: make this a util (convert string of int --> weekdays?)
              const skipNextMatch = payload.skip_next_match ? 'ON' : 'OFF';
              zulipHandler = {
                messageType: 'OK',
                messageData: `Skip next match: ${skipNextMatch}`
              };
            }
          })();
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
    if (zulipHandler.messageType) {
      sendMessage(senderEmail, zulipHandler.messageData);
    } else if (zulipHandler.log) {
      logger.info(zulipHandler.messageData);
    }
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
