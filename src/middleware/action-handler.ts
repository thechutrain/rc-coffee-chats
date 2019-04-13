/**
 * dispatches command/action
 */

import * as types from '../types';

/** Rules that guide what function gets invoked with what action
 *  && what messages get sent if functions are successful
 */
// NOTE: all errors thrown in action functions will be handled
// by the dispatcher(), which will send a generic error msg:
export const ActionHandlerMap: types.ActionHandlerMap = {
  __PROMPT_SIGNUP() {
    return {
      msgTemplate: types.msgTemplate.PROMPT_SIGNUP
    };
  },
  __REGISTER(ctx, _, zulipReqBody) {
    ctx.db.User.add({
      email: ctx.userEmail,
      full_name: zulipReqBody.message.sender_full_name
    });

    return { msgTemplate: types.msgTemplate.SIGNED_UP };
  },
  ////////////////
  // SHOW
  ////////////////
  SHOW__DAYS(ctx) {
    const User = ctx.db.User.findByEmail(ctx.userEmail);

    const coffeeDays = User.coffee_days
      .split('')
      .map(day => {
        return types.WEEKDAY[day];
      })
      .join(' ');

    return {
      msgTemplate: types.msgTemplate.STATUS_DAYS,
      msgArgs: {
        coffeeDays
      }
    };
  },
  SHOW__SKIP() {
    // TODO: find the days that were skipped
    return {
      msgTemplate: types.msgTemplate.STATUS_DAYS
    };
  },
  ////////////////
  // UPDATE
  ////////////////
  UPDATE__DAYS(ctx, actionArgs, zulipReqBody) {
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
      msgTemplate: types.msgTemplate.UPDATED_GENERAL,
      msgArgs: {
        setting_key: 'Coffee Days',
        setting_value: coffeeDays
      }
    };
  },
  UPDATE__SKIP(ctx, actionArgs, zulipReqBody) {
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

    const blnWarning = trueArgs.indexOf(actionArgs[0]) !== -1 ? true : false;
    ctx.db.User.updateSkipNextMatch(ctx.userEmail, blnWarning);
    const { skip_next_match } = ctx.db.User.findByEmail(ctx.userEmail);

    return {
      msgTemplate: types.msgTemplate.UPDATED_GENERAL,
      msgArgs: {
        setting_key: 'Skip Next Match',
        setting_value: skip_next_match === 1 ? 'True' : 'False'
      }
    };
  },
  ////////////////
  // HELP
  ////////////////
  HELP() {
    return { msgTemplate: types.msgTemplate.HELP };
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
    const actionfn = MapActionToFn[action];

    // Note: these actions are not coded for async action! but we can just wrap with async & await
    try {
      return actionfn(ctx, actionArgs, zulipBody);
    } catch (e) {
      console.warn(`Error trying to dispatch an action: ${action}`);
      return {
        msgTemplate: types.msgTemplate.ERROR,
        msgArgs: { errorMessage: e }
      };
    }
  };
}
