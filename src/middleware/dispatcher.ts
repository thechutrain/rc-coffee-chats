/**
 * dispatches command/action
 */

import * as types from '../types';

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

    if (!(action in types.Action)) {
      req.local.errors.push({ errorType: types.ErrorTypes.NO_VALID_ACTION });
      next();
      return;
    }

    const currUser = req.local.user.email;
    let dispatchResult;
    try {
      dispatchResult = dispatcher[`${action}`](currUser);
    } catch (e) {
      console.log('could not dispatch action');
    }

    console.log(dispatchResult);
    next();
  };
}

export class Dispatcher {
  private db: any;

  constructor(db) {
    this.db = db;
  }

  public updateDays(targetUser) {
    console.log(targetUser);
    return 'updated days!';
  }
}
