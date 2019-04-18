/**
 * dispatches command/action
 */
import * as types from '../types';
import { getProjectIssues } from '../utils/getIssues';

/** Rules that guide what function gets invoked with what action
 *  && what messages get sent if functions are successful
 */
// NOTE: all errors thrown in action functions will be handled
// by the dispatcher(), which will send a generic error msg:
export const ActionHandlerMap: types.ActionHandlerMap = {
  __PROMPT_SIGNUP() {
    return new Promise(resolve => {
      resolve({
        msgTemplate: types.msgTemplate.PROMPT_SIGNUP
      });
    });
  },
  __REGISTER(ctx, _, zulipReqBody) {
    return new Promise(resolve => {
      ctx.db.User.add({
        email: ctx.userEmail,
        full_name: zulipReqBody.message.sender_full_name
      });

      resolve({ msgTemplate: types.msgTemplate.SIGNED_UP });
    });
  },
  ////////////////
  // SHOW
  ////////////////
  SHOW__DAYS(ctx) {
    return new Promise(resolve => {
      const User = ctx.db.User.findByEmail(ctx.userEmail);

      const coffeeDays = User.coffee_days
        .split('')
        .map(day => {
          return types.WEEKDAY[day];
        })
        .join(' ');

      resolve({
        msgTemplate: types.msgTemplate.STATUS_DAYS,
        msgArgs: {
          coffeeDays
        }
      });
    });
  },
  SHOW__SKIP(ctx) {
    return new Promise(resolve => {
      const { skip_next_match } = ctx.db.User.findByEmail(ctx.userEmail);
      // TODO: feature that lets user know when their next match is schedule to be

      const msgTemplate =
        skip_next_match === 1
          ? types.msgTemplate.STATUS_SKIP_TRUE
          : types.msgTemplate.STATUS_SKIP_FALSE;

      resolve({
        msgTemplate
      });
    });
  },
  SHOW__WARNINGS(ctx) {
    return new Promise(resolve => {
      const { warning_exception } = ctx.db.User.findByEmail(ctx.userEmail);
      const msgTemplate =
        warning_exception === 1
          ? types.msgTemplate.STATUS_WARNINGS_ON
          : types.msgTemplate.STATUS_WARNINGS_OFF;

      resolve({
        msgTemplate
      });
    });
  },
  ////////////////
  // UPDATE
  ////////////////
  UPDATE__DAYS(ctx, actionArgs) {
    return new Promise(resolve => {
      if (actionArgs.length === 0) {
        throw new Error(
          `Must provide at least one day to be signed up for with Coffee Chat bot in order to stay active!\n If you'd like to no longer be paired up for matches you can deactive your account by typing: "**Update Active False**"`
        );
      }
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

      resolve({
        msgTemplate: types.msgTemplate.UPDATED_GENERAL,
        msgArgs: {
          setting_key: 'Coffee Days',
          setting_value: coffeeDays
        }
      });
    });
  },
  UPDATE__SKIP(ctx, actionArgs) {
    return new Promise(resolve => {
      // Validate arguments:
      const trueArgs = ['1', 'TRUE', 'YES'];
      const falseArgs = ['0', 'FALSE', 'NO'];
      const validArgs = new Set([...trueArgs, ...falseArgs]);
      if (actionArgs.length !== 1) {
        throw new Error(
          `Update skip takes one boolean argument. The following are valid arguments: *${trueArgs.join(
            ', '
          )}, ${falseArgs.join(', ')}*`
        );
      } else if (!validArgs.has(actionArgs[0])) {
        throw new Error(`${actionArgs[0]} is not a valid argument`);
      }

      const blnSkip = trueArgs.indexOf(actionArgs[0]) !== -1 ? true : false;
      ctx.db.User.updateSkipNextMatch(ctx.userEmail, blnSkip);
      const { skip_next_match } = ctx.db.User.findByEmail(ctx.userEmail);

      resolve({
        msgTemplate: types.msgTemplate.UPDATED_GENERAL,
        msgArgs: {
          setting_key: 'Skip Next Match',
          setting_value: skip_next_match === 1 ? 'True' : 'False'
        }
      });
    });
  },
  UPDATE__WARNINGS(ctx, actionArgs) {
    return new Promise(resolve => {
      const trueArgs = ['1', 'TRUE', 'YES', 'ON'];
      const falseArgs = ['0', 'FALSE', 'NO', 'OFF'];
      const validArgs = new Set([...trueArgs, ...falseArgs]);

      if (actionArgs.length !== 1) {
        throw new Error(
          `Update skip takes one boolean argument. The following are valid arguments: *${trueArgs.join(
            ', '
          )}, ${falseArgs.join(', ')}*`
        );
      } else if (!validArgs.has(actionArgs[0])) {
        throw new Error(`${actionArgs[0]} is not a valid argument`);
      }

      const blnWarning = trueArgs.indexOf(actionArgs[0]) !== -1 ? true : false;
      ctx.db.User.updateWarnings(ctx.userEmail, blnWarning);
      const { warning_exception } = ctx.db.User.findByEmail(ctx.userEmail);

      resolve({
        msgTemplate: types.msgTemplate.UPDATED_GENERAL,
        msgArgs: {
          setting_key: 'Warning Exceptions',
          setting_value: warning_exception === 1 ? 'True' : 'False'
        }
      });
    });
  },
  ////////////////
  // HELP
  ////////////////
  HELP() {
    return new Promise(resolve => {
      resolve({ msgTemplate: types.msgTemplate.HELP });
    });
  },
  HELP__SHOW() {
    return new Promise(resolve => {
      resolve({ msgTemplate: types.msgTemplate.HELP_SHOW });
    });
  },
  HELP__UPDATE() {
    return new Promise(resolve => {
      resolve({
        msgTemplate: types.msgTemplate.HELP_UPDATE
      });
    });
  },
  ////////////////
  // BOT
  ////////////////
  BOT__ISSUES() {
    return new Promise(async resolve => {
      const num_issues = await getProjectIssues();

      resolve({ msgTemplate: types.msgTemplate.HELP_SHOW });
    });
  }
};

/** ======== Middleware function takes action
 *  --> dispatches an action that returns a message
 *
 */
export function initActionHandler(db: types.myDB) {
  const dispatcher = initDispatcher(ActionHandlerMap);

  return async (req: types.IZulipRequest, res, next) => {
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
    const { msgTemplate, msgArgs } = await dispatcher(
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
) => Promise<types.IMsg> {
  return async function dispatcher(ctx, action, actionArgs, zulipBody) {
    const actionfn = MapActionToFn[action];

    // Note: these actions are not coded for async action! but we can just wrap with async & await
    try {
      const IMsg = await actionfn(ctx, actionArgs, zulipBody);
      return IMsg;
    } catch (e) {
      console.warn(`Error trying to dispatch an action: ${action}`);
      return {
        msgTemplate: types.msgTemplate.ERROR,
        msgArgs: { errorMessage: e }
      };
    }
  };
}
