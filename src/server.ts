import express from 'express';
import bodyParser from 'body-parser';
// import path from 'path';
import logger from './logger';
import { parseZulipServerRequest } from './zulip_coms/zulipCli';
import { initDB } from './db/db';
import { initZulipMessenger } from './zulip_coms/zulipMessenger';

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

  const { sendMessage } = await initZulipMessenger();

  /////////////////
  /// Server
  /////////////////
  const app = express();
  app.use(bodyParser.json());

  app.get('/', (request, response) => {
    logger.info('this is a test log from the / route');
    response.send('Hi');
  });

  // Handle messages received from Zulip outgoing webhooks
  app.post('/webhooks/zulip', (req, res) => {
    const cliAction = parseZulipServerRequest(req.body);
    // Distinguishing errors & successful parsing?
    console.log(`\n ------- new cli action -------`);

    const email = sendMessage();

    res.json(cliAction);
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
