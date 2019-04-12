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
    fn(ctx, _, zulipReqBody) {
      return ctx.db.User.add({
        email: ctx.userEmail,
        full_name: zulipReqBody.message.sender_full_name
      });
    }
  },
  ////////////////
  // SHOW
  ////////////////
  SHOW__DAYS: {
    okMsg: { msgTemplate: types.msgTemplate.SHOW_DAYS },
    fn(ctx) {
      const User = ctx.db.User.findByEmail(ctx.userEmail);
      if (!User) {
        throw new Error(`Could not find given user @ "${ctx.userEmail}"`);
      }
      const coffeeDays = User.coffee_days
        .split('')
        .map(day => {
          return types.WEEKDAY[day];
        })
        .join(' ');

      return {
        coffeeDays
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
    fn(ctx, actionArgs, zulipReqBody) {
      console.log(actionArgs);

      const weekdaysStr = actionArgs.weekdays
        .split('')
        .map(day => {
          return types.WEEKDAY[day];
        })
        .join();

      console.log(weekdaysStr);

      const { changes } = ctx.db.User.updateDays(ctx.userEmail, weekdaysStr);
      const UpdatedUser = ctx.db.User.findByEmail(ctx.userEmail);
      if (!UpdatedUser) {
        throw new Error(`No user found!`);
      }
      const coffeeDays = UpdatedUser.coffee_days
        .split('')
        .map(day => {
          return types.WEEKDAY[day];
        })
        .join(' ');

      return {
        coffeeDays,
        changes
      };
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
export function initActionHandler(db: types.myDB) {
  const dispatcher = initDispatcher(ActionHandlerMap);

  return (req: types.IZulipRequest, res, next) => {
    // Case: errors are already present, skip the dispatcher middleware
    // Case: no action specified, skip this middleware
    if (req.local.errors.length !== 0 || req.local.action.actionType === null) {
      console.log('there was an error so skipping ....');
      next();
      return;
    }

    // TODO: make this targetUser, originUser separate
    const userEmail = req.local.user.email;
    const { actionType } = req.local.action;
    const ctx = {
      db,
      userEmail
    };
    const { msgTemplate, msgArgs } = dispatcher(
      ctx,
      actionType,
      req.local.cmd.args,
      req.body
    );

    req.local.msgInfo = { msgTemplate, msgArgs, sendTo: userEmail };

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
): (
  ctx: types.ICtx,
  action: types.Action,
  actionArgs: any[],
  zulipBody: types.IZulipBody
) => types.IMsg {
  return function dispatcher(ctx, action, actionArgs, zulipBody) {
    const { fn, okMsg, errMsg } = MapActionToFn[action];

    // Case: no function to run for a given action
    if (!fn) {
      return { msgTemplate: okMsg.msgTemplate, msgArgs: {} };
    }

    let msgTemplate;
    let msgArgs = {};

    // Note: these actions are not coded for async action! but we can just wrap with async & await
    try {
      msgArgs = fn(ctx, actionArgs, zulipBody) || {};
      msgTemplate = okMsg.msgTemplate;
    } catch (e) {
      console.warn(`Error trying to dispatch an action: ${action}`);

      msgTemplate = errMsg ? errMsg.msgTemplate : types.msgTemplate.ERROR;
      msgArgs = { errorMessage: e };
    }

    return { msgTemplate, msgArgs };
  };
}
