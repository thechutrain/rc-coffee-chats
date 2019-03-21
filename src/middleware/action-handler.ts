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
    // tslint:disable-next-line:object-literal-shorthand
    fn(actionArgs) {
      console.log(`!!!! INSIDE REGISTER FN`);
      console.log(this);
      console.log(this.db);
      console.log(this.db.db);

      const result = this.db.user.add({
        email: `alancodes@gmail.com`,
        full_name: `alancodes@gmail.com`
      });

      console.log(result);
      // console.log('WHAT DOES THIS look like???');
      // console.log(this);

      // console.log('WHAT DOES this.user look like??');
      // console.log(this.user);
      // const db = JSON.stringify(ctx);
      // console.log(db);
      // console.log(ctx.db.user);

      // const result = ctx.db.user.add({
      //   email: ctx.originUser,
      //   full_name: ctx.originUser
      // });
      // console.log(result);
      console.log('....finished registering \n');
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
): (ctx: any, action: types.Action, actionArgs: any) => types.IMsg {
  return function dispatcher(ctx, action, actionArgs) {
    const { fn, okMsg, errMsg } = MapActionToFn[action];

    console.log('CONTEXT from inside the dispatch fn:');
    console.log(ctx);

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
      // msgArgs = fn.call(ctx, ctx, actionArgs);
      msgArgs = fn.call(ctx, actionArgs);
      msgTemplate = okMsg.msgTemplate;
    } catch (e) {
      msgTemplate = errMsg ? errMsg.msgTemplate : types.msgTemplate.ERROR;
      msgArgs = { errorMessage: e };
    }

    return { msgTemplate, msgArgs };
  };
}
