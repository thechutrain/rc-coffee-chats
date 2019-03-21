/**
 * dispatches command/action
 */

import * as types from '../types';

/** Rules that guide what function gets invoked with what action
 *  && what messages get sent if functions are successful
 */
export const ActionHandlerMap: types.ActionHandlerMap = {
  // NOTE: all errors thrown in action functions will be handled
  // by the dispatcher(), which will send a generic error msg:
  __PROMPT_SIGNUP: {
    okMsg: { msgTemplate: types.msgTemplate.PROMPT_SIGNUP }
  },
  __REGISTER: {
    okMsg: { msgTemplate: types.msgTemplate.SIGNED_UP },
    fn(actionArgs) {
      const result = this.db.user.add({
        email: this.originUser,
        full_name: this.originUser // TODO: get this from user
      });

      // TODO: add the typescript definitions to database
      if (result.status === 'ERROR') {
        throw new Error(`${result.message}`);
      }
    }
  },
  ////////////////
  // SHOW
  ////////////////
  SHOW__DAYS: {
    okMsg: { msgTemplate: types.msgTemplate.SHOW_DAYS },
    fn(actionArgs) {
      const { coffeeDays } = this.db.user.getCoffeeDays(this.originUser);

      return {
        coffeeDays: `${coffeeDays.join(' ')}`
      };
    }
  },
  ////////////////
  // UPDATE
  ////////////////
  UPDATE__DAYS: {
    okMsg: {
      msgTemplate: types.msgTemplate.UPDATED_DAYS
    },
    fn(actionArgs) {
      // TODO: need to validate

      // QUESTION: should db function just try to validate?
      this.db.user.updateCoffeeDays(this.originUser, actionArgs);
    }
  },
  HELP: {
    okMsg: {
      msgTemplate: types.msgTemplate.HELP
      // reqArgs: { a: Number }
    }
  }
};

/** ======== Middleware function takes action
 *  --> dispatches an action that returns a message
 *
 */
export function initActionHandler(db) {
  const dispatcher = initDispatcher(ActionHandlerMap);

  return (req: types.IZulipRequest, res, next) => {
    // Case: errors are already present, skip the dispatcher middleware
    // Case: no action specified, skip this middleware
    if (req.local.errors.length !== 0 || req.local.action.actionType === null) {
      console.log('there was an error so skipping ....');
      next();
      return;
    }

    const { actionType, originUser } = req.local.action;
    const ctx = {
      ...db,
      originUser
    };
    const { msgTemplate, msgArgs } = dispatcher(
      ctx,
      actionType,
      req.local.cmd.args
    );

    req.local.msgInfo = { msgTemplate, msgArgs, sendTo: originUser };

    console.log('======== INFO ========');
    console.log('req.local.action:');
    console.log(req.local.action);
    console.log('\nreq.local.msgInfo');
    console.log(req.local.msgInfo);
    console.log('======= END of actionHandler ======\n');
    next();
  };
}

/** ==== more testable dispatcher ====
 *
 * @param ctx
 * @param MapActionToFn
 */
export function initDispatcher(
  MapActionToFn: types.ActionHandlerMap
): (ctx: any, action: types.Action, actionArgs: any[]) => types.IMsg {
  // QUESTION: could I not create ctx in the outer initDispatcher function
  // and pass it into fn.call(ctx)? why weren't my fn for db.user there?

  return function dispatcher(ctx, action, actionArgs) {
    const { fn, okMsg, errMsg } = MapActionToFn[action];

    // console.log('CONTEXT from inside the dispatch fn:');
    // console.log(ctx);

    // Case: no function to run for a given action
    if (!fn) {
      return { msgTemplate: okMsg.msgTemplate, msgArgs: {} };
    }

    // Case: Run a fn for a given action -->
    // 1) results in okMsg
    // 2) results in errMsg
    let msgTemplate;
    let msgArgs = {};

    // Note: these actions are not coded for
    // async action! but we can just wrap with async & await
    try {
      // QUESTION: better to have ctx be pointed to this? or to just pass it in
      // as an argument?
      // QUESTION: fn is placeholder for a fn, how to get TS support in this case?
      // ... probably have to explicitly make a type signature
      msgArgs = fn.call(ctx, actionArgs) || {};
      msgTemplate = okMsg.msgTemplate;
    } catch (e) {
      // TODO: make req.local.error
      // QUESTION: should I make a msg here or just create the req.local.error?

      msgTemplate = errMsg ? errMsg.msgTemplate : types.msgTemplate.ERROR;
      msgArgs = { errorMessage: e };
    }

    return { msgTemplate, msgArgs };
  };
}
