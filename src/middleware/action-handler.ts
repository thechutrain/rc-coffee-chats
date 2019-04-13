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
      msgTemplate: types.msgTemplate.UPDATED_GENERAL
    },
    fn(ctx, actionArgs, zulipReqBody) {
      // Validate that all the arguments are in Weekdays
      const weekdays = actionArgs.map(day => {
        if (!(day in types.WEEKDAY)) {
          throw new Error(
            `Inproper input for updating days. Received: "${day}". Use the first three letters for each day of the week`
          );
        } else if (!isNaN(parseInt(day, 10))) {
          // Case: where user gave us a number
          throw new Error(
            `Please provide days of the week using the first three letters for each day of the week, not as an integer.`
          );
        }

        return types.WEEKDAY[day]; // return int of the day
      });

      // Must save the days of the week as a string of numbers
      ctx.db.User.updateDays(ctx.userEmail, weekdays);
      const User = ctx.db.User.findByEmail(ctx.userEmail);
      const coffeeDays = User.coffee_days
        .split('')
        .map(day => {
          return types.WEEKDAY[day];
        })
        .join(' ');

      return {
        setting_key: 'Coffee Days',
        setting_value: coffeeDays
      };
    }
  },
  UPDATE__SKIP: {
    okMsg: {
      msgTemplate: types.msgTemplate.UPDATED_GENERAL
    },
    fn(ctx, actionArgs, zulipReqBody) {
      // Validate arguments:
      const trueArgs = ['1', 'TRUE', 'YES'];
      const falseArgs = ['0', 'FALSE', 'NO'];
      const validArgs = new Set([...trueArgs, ...falseArgs]);
      if (actionArgs.length !== 1) {
        throw new Error(
          `Update skip takes one boolean argument. The following are valid arguments: *${trueArgs.join(
            ','
          )}, ${falseArgs.join(',')}*`
        );
      } else if (!validArgs.has(actionArgs[0])) {
        throw new Error(`${actionArgs[0]} is not a valid argument`);
      }

      // Determine if its true or false
      const blnWarning = trueArgs.indexOf(actionArgs[0]) !== -1 ? true : false;
      ctx.db.User.updateSkipNextMatch(ctx.userEmail, blnWarning);
      const { skip_next_match } = ctx.db.User.findByEmail(ctx.userEmail);
      console.log(typeof skip_next_match);
      console.log(skip_next_match);
      return {
        setting_key: 'Skip Next Match',
        setting_value: skip_next_match === '1' ? 'True' : 'False'
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

    console.log('\n======= Start of actionHandler ======');
    console.log('req.local.action:');
    console.log(req.local.action);
    console.log('\nreq.local.msgInfo');
    console.log(req.local.msgInfo);
    console.log('\n');
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
