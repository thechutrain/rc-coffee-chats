/**
 * dispatches command/action
 */

import * as types from '../types';
import { type } from 'os';

export const ActionHandlerMap: types.ActionHandlerMap = {
  UPDATE_DAYS: {
    fn: 'updateDays'
  },
  SHOW_DAYS: {},
  HELP: {}
};

export function initDispatcher(db) {
  const dispatcher = new Dispatcher(db);

  return (req: types.IZulipRequest, res, next) => {
    if (req.local.errors.length !== 0) {
      next();
      return;
    }

    const action = req.local.cli.action;

    if (action === null) {
      next();
      return;
    } else if (!(action in types.Action)) {
      req.local.errors.push({ errorType: types.ErrorTypes.NO_VALID_ACTION });
      next();
      return;
    }

    const { currentUser, targetUser, args: userInput } = req.local.cli;
    const dispatchArgs: types.IDispatchArgs = {
      currentUser,
      targetUser,
      userInput
    };

    const fnToDispatch = ActionHandlerMap[action].fn;

    let dispatchResult;

    try {
      dispatchResult = dispatcher[`${fnToDispatch}`](dispatchArgs);
    } catch (e) {
      console.log('could not dispatch action');
    }

    // Check if dispatch Result has an error
    if (dispatchResult.status === 'ERROR') {
      console.log('ERROR: failed to dispatch action');
      req.local.errors.push({
        errorType: types.ErrorTypes.FAILED_DISPATCHED_ACTION,
        customMessage: dispatchResult.errorMessage
      });
    }

    console.log(dispatchResult);
    req.local.msgInfo = {
      sendToEmail: currentUser,
      msgType: types.okMessages.HELP
    };
    console.log('====== end of dispatch middleware ========');
    next();
  };
}

export class Dispatcher {
  private db: any;
  // private currUser: string;
  // private targetUser: string;

  constructor(db) {
    this.db = db;
    // this.currUser = currUser;
    // this.targetUser = targetUser || currUser;
  }

  public updateDays(args: types.IDispatchArgs): types.DispatchResult {
    const { targetUser, userInput } = args;

    return this.db.user.updateCoffeeDays(targetUser, userInput);
  }
}
