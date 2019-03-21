/**
 * dispatches command/action
 */

import * as types from '../types';

/** Rules that guide what function gets invoked with what action
 *  && what messages get sent if functions are successful
 */
export const ActionHandlerMap: types.ActionHandlerMap = {
  PROMPT_SIGNUP: {
    okMsg: { msgTemplate: types.msgTemplate.PROMPT_SIGNUP }
  },
  REGISTER: {
    okMsg: { msgTemplate: types.msgTemplate.SIGNED_UP },
    fn(ctx, actionArgs) {
      console.log('about to register user ...');
      const result = ctx.db.user.add({
        email: ctx.originUser,
        full_name: ctx.originUser
      });
      console.log(result);
      console.log('====== result from db ======');
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
export function initActionHandler(ctx: { db: any }) {
  const dispatcher = initDispatcher(ctx, ActionHandlerMap);

  return (req: types.IZulipRequest, res, next) => {
    // Case: errors are already present, skip the dispatcher middleware
    // Case: no action specified, skip this middleware
    if (req.local.errors.length !== 0 || req.local.action.actionType === null) {
      console.log('there was an error so skipping ....');
      next();
      return;
    }

    const { actionType, originUser } = req.local.action;
    const { msgTemplate, msgArgs } = dispatcher(actionType, req.local.cmd.args);

    req.local.msgInfo = { msgTemplate, msgArgs, sendTo: originUser };

    console.log(req.local.action);
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
  ctx,
  MapActionToFn: types.ActionHandlerMap
): (action: types.Action, actionArgs: any) => types.IMsg {
  return (action, actionArgs) => {
    const { fn, okMsg, errMsg } = MapActionToFn[action];

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
    console.log('==== about to try to invoke function ===\n');
    try {
      // QUESTION: better to have ctx be pointed to this? or to just pass it in
      // as an argument?
      msgArgs = fn.call(ctx, ctx, actionArgs);
      msgTemplate = okMsg.msgTemplate;
    } catch (e) {
      msgTemplate = errMsg ? errMsg.msgTemplate : types.msgTemplate.ERROR;
      msgArgs = { errorMessage: e };
    }
    console.log(msgTemplate);
    console.log(msgArgs);
    console.log('====== msgType & args=======');
    return { msgTemplate, msgArgs };
  };
}
