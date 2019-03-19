/**
 * This is the glue that connects commands that have been parsed from zulip
 * messages and attempts to update/read from the Database
 */
import * as types from '../types';

import { Status } from '../cli-dispatcher/status';

export function initCliActionDispatcher(db) {
  const StatusHandler = new Status(db);

  return (req: types.IZulipRequest, res, next) => {
    //////////////
    // Validation
    //////////////
    // If there are errors do not attempt to dispatch action
    if (req.local.errors.length !== 0) next();

    const { directive, subcommand, args } = req.local.cli;
    if (!(directive in types.CliDirectives)) {
      req.local.errors.push({
        msgType: types.ErrorMessages.NOT_VALID_DIRECTIVE,
        customMessage: `${req.local.cli.directive} is not a valid directive`
      });
    }

    /////////////
    // Attempt to dispatch action
    /////////////
    let error = null;
    // let sqlResult;
    try {
      switch (directive) {
        case types.CliDirectives.STATUS:
          console.log('Received STATUS request');
          StatusHandler.dispatch(subcommand, args);
          break;
        case types.CliDirectives.UPDATE:
          console.log('Received UPDATE request');
          break;
        case types.CliDirectives.HELP:
          console.log('Received HELP request');
          break;

        default:
          throw new Error('This should never happen');
      }
    } catch (e) {
      console.log(e);
      error = e;
    }

    // TODO:
    if (error) {
      // req.local.errors.push({
      //   msgType: types.ErrorMessages.
      // })
    }

    next();
  };
}
