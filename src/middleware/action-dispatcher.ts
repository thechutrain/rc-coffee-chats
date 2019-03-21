/**
 * dispatches command/action
 */

import * as types from '../types';

export const ActionHandlerMap: types.ActionHandlerMap = {
  // PROMPT_SIGNUP: {
  //   fn: 'promptSignUp'
  //   // okMsg: types.okMsg.PROMPT_SIGNUP
  // },
  // REGISTER: {
  //   fn: 'register'
  //   // okMsg: types.okMsg.SIGNED_UP
  // },
  // UPDATE_DAYS: {
  //   fn: 'updateDays'
  //   // okMsg: types.okMsg.UPDATED_DAYS
  // },
  // SHOW_DAYS: {
  //   fn: 'showDays'
  //   // okMsg: types.okMsg.STATUS_DAYS
  // },
  // SHOW_HELP: {
  //   fn: 'showHelp'
  // },
  SHOW_HELP: {
    fn: function help(name: string) {
      console.log(this.db);
      console.log(name);
    }
  }
};

export function initDispatcher(db) {
  const dispatcher = new Dispatcher(db);

  return (req: types.IZulipRequest, res, next) => {
    // Case: errors are already present, skip the dispatcher middleware
    // Case: no action specified, skip this middleware
    if (req.local.errors.length !== 0 || req.local.action.type === null) {
      next();
      return;
    }

    const ctx = {
      db: 'database'
    };
    ///// testing ///////
    const f = 'SHOW_HELP';
    dispatcher[`${f}`].call(ctx, 'my name');

    next();
    return;

    const { type: actionType, currentUser, targetUser } = req.local.action;

    const { fn } = ActionHandlerMap[actionType];
    const { args: userInput } = req.local.cmd;
    const dispatchArgs: types.IDispatchArgs = {
      currentUser,
      targetUser: targetUser || currentUser,
      userInput
    };

    // if (!(actionType in types.Action)) {
    //   req.local.errors.push({ errorType: types.Errors.NO_VALID_ACTION });
    //   next();
    //   return;
    // }

    // let promisedMsg: Promise<types.IMsg>;
    let promisedMsg: Promise<types.IMsg>;
    try {
      // QUESTION: is this hacky?
      promisedMsg = dispatcher[`${fn}`](dispatchArgs);
    } catch (e) {
      const errorMessage = `Error: ${fn}() does not exist on the dispatcher class. This is a valid action, but there is no method handler for this function. Please alert the maintainer of this or create a github issue.`;
      console.warn(errorMessage);

      req.local.errors.push({
        errorType: types.Errors.DISPATCH_ACTION_DOES_NOT_EXIST,
        customMessage: errorMessage
      });

      req.local.msgInfo = {
        sendToEmail: currentUser, // TODO: make this an array so admin gets a copy too!
        msgType: types.msgTemplate.ERROR,
        msgArgs: {
          errorType: types.Errors.DISPATCH_ACTION_DOES_NOT_EXIST,
          message: errorMessage
        }
      };
      next();
      return;
    }

    promisedMsg
      .then((msgInfo: types.IMsg) => {
        req.local.msgInfo = { ...msgInfo, sendToEmail: currentUser };
        next();
      })
      .catch(error => {
        req.local.msgInfo = {
          sendToEmail: currentUser,
          msgType: types.msgTemplate.ERROR,
          msgArgs: {
            errorType: types.Errors.NOPE,
            message: error
          }
        };
        next();
      });
  };
}

// NOTE: make all dispatch methods a promise that once they are resolved, create a message with payload:
export class Dispatcher {
  private db: any;

  constructor(db) {
    this.db = db;
  }

  public promptSignUp(args: types.IDispatchArgs): Promise<types.IMsg> {
    return new Promise(resolve => {
      resolve({
        msgType: types.msgTemplate.PROMPT_SIGNUP
      });
    });
  }

  public register(args: types.IDispatchArgs): Promise<types.IMsg> {
    return new Promise(resolve => {
      const { status } = this.db.user.add({
        email: args.currentUser,
        full_name: args.currentUser // TODO: get this from req.body.message ...
      });

      if (status === 'OK') {
        resolve({
          msgType: types.msgTemplate.SIGNED_UP
        });
      } else {
        resolve({
          msgType: types.msgTemplate.ERROR,
          msgArgs: {
            errorMessage: `Could not register new user`
          }
        });
      }
    });
  }

  public showHelp(args: types.IDispatchArgs): Promise<types.IMsg> {
    return new Promise(resolve => {
      resolve({
        msgType: types.msgTemplate.HELP
      });
    });
  }

  // public updateDays(args: types.IDispatchArgs): Promise<types.IMsg> {
  //   return new Promise((resolve, reject) => {
  //     const { targetUser, userInput } = args;
  //     // this.db.user.updateCoffeeDays(targetUser, userInput);

  //     resolve({
  //       msgType: types.msgTemplate.UPDATED_DAYS
  //     });
  //   });
  // }
}
