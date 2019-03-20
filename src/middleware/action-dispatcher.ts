/**
 * dispatches command/action
 */

import * as types from '../types';

export const ActionHandlerMap: types.ActionHandlerMap = {
  UPDATE_DAYS: {
    fn: 'updateDays',
    okMsg: types.okMsg.UPDATED_DAYS
  },
  SHOW_DAYS: {
    fn: 'showDays',
    okMsg: types.okMsg.STATUS_DAYS
  }
  // HELP: {}
};

export function initDispatcher(db) {
  const dispatcher = new Dispatcher(db);

  return (req: types.IZulipRequest, res, next) => {
    if (req.local.errors.length !== 0) {
      next();
      return;
    }

    const { type: actionType, currentUser, targetUser } = req.local.action;

    if (actionType === null) {
      next();
      return;
    } else if (!(actionType in types.Action)) {
      req.local.errors.push({ errorType: types.Errors.NO_VALID_ACTION });
      next();
      return;
    }

    const { args: userInput } = req.local.cli;
    const dispatchArgs: types.IDispatchArgs = {
      currentUser,
      targetUser,
      userInput
    };

    const { fn, okMsg, errMsg } = ActionHandlerMap[actionType];
    let dispatchResult: types.DispatchResult;

    try {
      dispatchResult = dispatcher[`${fn}`](dispatchArgs);
    } catch (e) {
      console.warn(`Function: ${fn} does not exist on the dispatch class.`);
      const errorMessage = `Error: ${fn}() does not exist on the dispatcher class. This is a valid action, but there is not method handler for this function. Please alert the maintainer of this or create a github issue.`;

      // QUESTION: push directly to errors or to msgInfo?
      // req.local.errors.push({
      //   errorType: types.ErrorTypes.DISPATCH_ACTION_DOES_NOT_EXIST,
      //   customMessage: errorMessage
      // });

      req.local.msgInfo = {
        sendToEmail: currentUser, // TODO: make this an array so admin gets a copy too!
        msgType: types.errMsg.GENERIC_ERROR,
        msgArgs: {
          errorType: types.Errors.DISPATCH_ACTION_DOES_NOT_EXIST,
          message: errorMessage
        }
      };

      next();
      return;
    }

    // Case: error dispatching result
    if (dispatchResult.status === 'OK') {
      req.local.msgInfo = {
        sendToEmail: currentUser,
        msgType: okMsg,
        msgArgs: dispatchResult
      };
    } else {
      console.log('ERROR: failed to dispatch action');
      req.local.msgInfo = {
        sendToEmail: currentUser,
        msgType: errMsg || types.errMsg.GENERIC_ERROR
      };
    }
    console.log('====== end of dispatch middleware ========');
    next();
    return;
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
