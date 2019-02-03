import express from 'express';
import bodyParser from 'body-parser';
import logger from './logger';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from './db/db';
import { parseZulipServerRequest } from './zulip_coms/cliParser';
import { sendMessage } from './zulip_coms/sendMessage';
import { directives } from './zulip_coms/interface';

(async () => {
  const PORT = process.env.PORT || 3000;

  /////////////////
  /// Database
  /////////////////
  const DB_FILE_NAME =
    process.env.NODE_ENV === 'production' ? 'prod.db' : 'dev.db';
  console.log(DB_FILE_NAME);
  const { user } = initDB(DB_FILE_NAME);

  user.createTable();

  /////////////////
  /// Zulip COMS
  /////////////////

  /////////////////
  /// Server
  /////////////////
  const app = express();
  app.use(bodyParser.json());

  app.get('/', (request, response) => {
    logger.info('this is a test log from the / route');
    sendMessage('alancodes@gmail.com', 'test message').catch(e => {
      console.log(e);
    });
    response.json({ sent: true });
    // .then(result => {
    //   response.json(result);
    // })
    // .catch(err => {
    //   response.json(err);
    // });
  });

  app.post('/', (request, response) => {
    console.log('POST REQUEST @ /');
    console.log('headers ....');
    console.log(request.header);
    console.log('body ....');
    console.log(request.body);
    response.send('ok received!');
  });

  // Handle messages received from Zulip outgoing webhooks
  app.post('/webhooks/zulip', (req, res) => {
    console.log(`\n ------- /webhooks/zulip -------`);
    let cliAction;
    let successMessage;
    let errorMessage;
    const senderEmail = req.body.data.message.sender_email;

    /////// Parse Zulip Message ////////
    try {
      cliAction = parseZulipServerRequest(req.body);
    } catch (e) {
      // sendMessage(senderEmail, e.message);
      return res.json({});
    }

    console.log(`Switch/Case: ${cliAction.directive}`);
    switch (cliAction.directive) {
      case directives.CHANGE:
        try {
          // apply the change?
          successMessage = user.createTable();
        } catch (e) {
          errorMessage = e.message;
        }
        break;
      case directives.STATUS:
        break;
      case directives.HELP:
        break;
    }

    res.json({});
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
  const listener = app.listen(PORT, () => {
    console.log(`🌍 is listening on port: ${PORT}`);
    // logger.info('Your app is listening on port ' + listener.address().port);
  });
})();
