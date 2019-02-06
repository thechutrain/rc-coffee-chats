import * as path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import logger from './logger';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from './db';
import { parseZulipServerRequest } from './zulip_coms/cliParser';
import { sendMessage, sendErrorMessage } from './zulip_coms/sendMessage';

import { directives, ICliAction, subCommands } from './zulip_coms/interface';
import { ISqlSuccess, ISqlError } from './db/db.interface';

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
    const DB_PATH = path.join(__dirname, DB_FILE);

    return initDB(DB_PATH, fileMustExist);
  })();

  /////////////////
  /// Server
  /////////////////
  const app = express();

  // ==== TESTING ====
  app.get('/', async (request, response) => {
    // logger.info('this is a test log from the / route');
    // const zulipMsg = await sendMessage(
    //   ['alancodes@gmail.com'],
    //   'test message from my local server'
    // )
    //   .then(result => {
    //     console.log(result);
    //     return { error: false };
    //   })
    //   .catch(e => {
    //     // ERROR OBJECT: of e.response.data
    //     // { code: 'BAD_REQUEST',
    //     // msg: 'Invalid email \'lancodes@gmail.com\'',
    //     // result: 'error' }
    //     console.log(e.response.data);
    //     return { error: true };
    //     // console.log(e);
    //   });
    // response.json(zulipMsg);
  });

  // ====== USED FOR TESTING =========
  // app.post(
  //   '/',
  //   bodyParser.urlencoded({ extended: true }),
  //   (request, response) => {
  //     console.log('POST REQUEST @ /');
  //     console.log('headers ....');
  //     console.log(request.headers);
  //     console.log('body ....');
  //     console.log(request.body);
  //     response.send('ok received!');
  //   }
  // );

  // Handle messages received from Zulip outgoing webhooks
  app.post('/webhooks/zulip', bodyParser.json(), (req, res) => {
    res.json({});
    let cliAction: ICliAction;
    // let successMessage: string; // SuccessHandler
    // interface ISuccessHandler {
    //   log: boolean;
    //   sendMessage?: boolean;
    //   message: string;
    // }

    let sqlResult: ISqlSuccess | ISqlError;
    const senderEmail = req.body.data.message.sender_email;

    /////// Parse Zulip Message ////////
    // TODO: modify parseZulipServerRequest --> make it a middleware
    // NOTE: Can move this into middle ware of this route?
    try {
      cliAction = parseZulipServerRequest(req.body);
    } catch (e) {
      sendMessage(senderEmail, e.message);
      console.log(e);
      return;
    }

    console.log('==== Received Valid cliAction =====');
    console.log(cliAction);

    if (cliAction.directive === directives.CHANGE) {
      /////////////////////////////////////
      // CHANGE subcommand switch block
      /////////////////////////////////////

      switch (cliAction.subCommand) {
        case subCommands.DAYS:
        case subCommands.DATES:
          console.log(`Try to change days to: ${cliAction.payload}`);
          // TODO: convert MON TUES WED --> 123
          sqlResult = db.user.updateCoffeeDays(senderEmail, {
            coffee_days: cliAction.payload
          });
          break;
        case subCommands.SKIP:
          console.log(`Will skip your next match: ${cliAction.payload}`);
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
          break;
        case subCommands.WARNINGS:
          console.log('Status for whether warnings or on/off');
          break;
        case subCommands.SKIP:
          console.log(
            `Status for whether youre going to SKIP next match or not`
          );
          break;
        case subCommands.MATCH:
          console.log(`Status for who your match is today`);
          break;

        default:
          console.log(`No handler writtern for ${cliAction.subCommand}`);
          break;
      }
    } else {
      /////////////////////////////////////
      // HELP subcommand switch block
      /////////////////////////////////////
    }

    // ====== Zulip Message ==========
    // if (errorMessage) {
    //   sendErrorMessage(senderEmail, errorMessage);
    // } else if (successMessage) {
    //   sendErrorMessage(senderEmail, successMessage);
    // }
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
