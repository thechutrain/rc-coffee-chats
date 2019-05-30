/**
 * dispatches command/action
 */
import { notifyAdmin } from '../zulip-messenger/notify-admin';
import { getProjectIssues } from '../utils/getIssues';

import { WEEKDAY } from '../types';
import { Action, ActionHandlerMap, ICtx } from '../types/actionTypes';
import { MsgTemplate, IMsg } from '../types/MsgTypes';
import {
  IZulipRequestWithMessage,
  ZulipBody
} from '../types/ZulipRequestTypes';
import { myDB } from '../types/dbTypes';

/** Rules that guide what function gets invoked with what action
 *  && what messages get sent if functions are successful
 */
// NOTE: all errors thrown in action functions will be handled
// by the dispatcher(), which will send a generic error msg:
export const actionHandlerMap: ActionHandlerMap = {
  // isRegistered CMDS
  __PROMPT_SIGNUP() {
    return new Promise(resolve => {
      resolve({
        msgTemplate: 'PROMPT_SIGNUP'
      });
    });
  },
  __REGISTER(ctx, _, zulipReqBody) {
    return new Promise(resolve => {
      ctx.db.User.add({
        email: ctx.userEmail,
        full_name: zulipReqBody.message.sender_full_name
      });

      resolve({ msgTemplate: 'SIGNED_UP' });
    });
  },
  // isActive CMDS
  __ACTIVATE(ctx) {
    return new Promise(resolve => {
      ctx.db.User.update({ is_active: 1 }, { email: ctx.userEmail });

      resolve({ msgTemplate: 'ACTIVATE' });
    });
  },
  __PROMPT_ACTIVATE() {
    return new Promise(resolve => {
      resolve({ msgTemplate: 'PROMPT_ACTIVATE' });
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
          return WEEKDAY[day];
        })
        .join(' ');

      resolve({
        msgTemplate: 'STATUS_DAYS',
        msgArgs: {
          coffeeDays
        }
      });
    });
  },
  SHOW__SKIP(ctx) {
    return new Promise(resolve => {
      const { skip_next_match } = ctx.db.User.findByEmail(ctx.userEmail);

      resolve({
        msgTemplate:
          skip_next_match === 1 ? 'STATUS_SKIPPING' : 'STATUS_NOT_SKIPPING'
      });
    });
  },
  SHOW__WARNINGS(ctx) {
    return new Promise(resolve => {
      // TESTING TEMP:
      notifyAdmin('multi-user test');

      const { warning_exception } = ctx.db.User.findByEmail(ctx.userEmail);

      resolve({
        msgTemplate:
          warning_exception === 0 ? 'STATUS_WARNINGS_ON' : 'STATUS_WARNINGS_OFF'
      });
    });
  },
  SHOW__PREVIOUS(ctx) {
    return new Promise(resolve => {
      const previousMatches = ctx.db.User.findPrevMatches(ctx.userEmail);
      const prevMatchesAsStr = previousMatches
        .map(match => {
          return `${match.date}: ${match.full_name}`;
        })
        .join('\n');

      resolve({
        msgTemplate: 'STATUS_PREVIOUS_MATCHES',
        msgArgs: { prevMatches: prevMatchesAsStr }
      });
    });
  },
  SHOW__FALLBACK(ctx) {
    return new Promise(resolve => {
      const fallBackEmail = ctx.db.Config.getFallBackUser();

      if (fallBackEmail) {
        resolve({
          msgTemplate: 'STATUS_FALLBACK',
          msgArgs: { email: fallBackEmail }
        });
      } else {
        resolve({
          msgTemplate: 'STATUS_FALLBACK_NULL'
        });
      }
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
      const weekdays = actionArgs.map(d => {
        // Note: input arguments are no longer all capitalized.
        const day = d.toUpperCase();
        if (!(day in WEEKDAY)) {
          throw new Error(
            `Inproper input for updating days. Received: "${day}". Use the first three letters for each day of the week`
          );
        } else if (!isNaN(parseInt(day, 10))) {
          // Case: where user gave us a number
          throw new Error(
            `Please provide days of the week using the first three letters for each day of the week, not as an integer.`
          );
        }

        return WEEKDAY[day]; // return int of the day
      });

      // Must save the days of the week as a string of numbers
      ctx.db.User.updateDays(ctx.userEmail, weekdays);
      const User = ctx.db.User.findByEmail(ctx.userEmail);
      const coffeeDays = User.coffee_days
        .split('')
        .map(day => {
          return WEEKDAY[day];
        })
        .join(' ');

      resolve({
        msgTemplate: 'UPDATED_GENERAL',
        msgArgs: {
          setting_key: 'Coffee Days',
          setting_value: coffeeDays
        }
      });
    });
  },
  UPDATE__SKIP(ctx, actionArgs) {
    return new Promise(resolve => {
      const inputCaps = actionArgs[0].toUpperCase();
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
      } else if (!validArgs.has(inputCaps)) {
        throw new Error(`${actionArgs[0]} is not a valid argument`);
      }

      const blnSkip = trueArgs.indexOf(inputCaps) !== -1 ? true : false;
      ctx.db.User.updateSkipNextMatch(ctx.userEmail, blnSkip);
      const { skip_next_match } = ctx.db.User.findByEmail(ctx.userEmail);

      resolve({
        msgTemplate: 'UPDATED_GENERAL',
        msgArgs: {
          setting_key: 'SKIPPING',
          setting_value: skip_next_match === 1 ? 'YES' : 'NO'
        }
      });
    });
  },

  UPDATE__WARNINGS(ctx, actionArgs) {
    return new Promise(resolve => {
      const inputCaps = actionArgs[0].toUpperCase();
      const trueArgs = ['1', 'TRUE', 'YES', 'ON'];
      const falseArgs = ['0', 'FALSE', 'NO', 'OFF'];
      const validArgs = new Set([...trueArgs, ...falseArgs]);

      if (actionArgs.length !== 1) {
        throw new Error(
          `Update skip takes one boolean argument. The following are valid arguments: *${trueArgs.join(
            ', '
          )}, ${falseArgs.join(', ')}*`
        );
      } else if (!validArgs.has(inputCaps)) {
        throw new Error(`${actionArgs[0]} is not a valid argument`);
      }

      const warningException =
        trueArgs.indexOf(inputCaps) !== -1 ? false : true;
      ctx.db.User.updateWarnings(ctx.userEmail, warningException);
      const { warning_exception } = ctx.db.User.findByEmail(ctx.userEmail);

      resolve({
        msgTemplate: 'UPDATED_GENERAL',
        msgArgs: {
          setting_key: 'Warning Notifications',
          setting_value: warning_exception === 0 ? 'ON' : 'OFF'
        }
      });
    });
  },
  UPDATE__ACTIVE(ctx, actionArgs) {
    return new Promise(resolve => {
      const inputCaps = actionArgs[0].toUpperCase();
      // VALIDATE:
      const falseArgs = ['0', 'FALSE', 'NO', 'OFF'];
      const validArgs = new Set([...falseArgs]);

      if (actionArgs.length !== 1) {
        throw new Error(
          `Update skip takes one boolean argument. The following are valid arguments: *${falseArgs.join(
            ', '
          )}*`
        );
      } else if (!validArgs.has(inputCaps)) {
        throw new Error(`${actionArgs[0]} is not a valid argument`);
      }

      // UPDATE QUERY:
      ctx.db.User.update({ is_active: 0 }, { email: ctx.userEmail });

      resolve({
        msgTemplate: 'DEACTIVATE'
      });
    });
  },

  UPDATE__FALLBACK(ctx, actionArgs) {
    return new Promise(resolve => {
      // CHECK that the user is an admin:
      if (ctx.user && ctx.user.is_admin) {
        ctx.db.Config.setFallBackUser(actionArgs[0]);
        const fallBackEmail = ctx.db.Config.getFallBackUser();
        resolve({
          msgTemplate: 'UPDATED_FALLBACK',
          msgArgs: {
            email: fallBackEmail
          }
        });
      } else {
        throw new Error(
          `You must be an admin in order to update the fallback user`
        );
      }
    });
  },
  ////////////////
  // HELP
  ////////////////
  HELP() {
    return new Promise(resolve => {
      resolve({ msgTemplate: 'HELP' });
    });
  },
  HELP__SHOW() {
    return new Promise(resolve => {
      resolve({ msgTemplate: 'HELP_SHOW' });
    });
  },
  HELP__UPDATE() {
    return new Promise(resolve => {
      resolve({
        msgTemplate: 'HELP_UPDATE'
      });
    });
  },
  ////////////////
  // BOT
  ////////////////
  BOT__HI() {
    return new Promise(resolve => {
      const helloResponses = ['Hey', 'Hi', 'Howdy', '👋'];
      const index = Math.floor(Math.random() * helloResponses.length);
      const greeting = helloResponses[index];
      resolve({
        msgTemplate: 'BLANK',
        msgArgs: {
          message: greeting
        }
      });
    });
  },
  BOT__STATS(ctx) {
    return new Promise(resolve => {
      const num_matches = ctx.db.UserMatch.totalMatchesToDate();

      resolve({
        msgTemplate: 'BOT_STATS',
        msgArgs: {
          num_matches: `${num_matches}`
        }
      });
    });
  },
  BOT__ISSUES() {
    return new Promise(async resolve => {
      const num_issues = await getProjectIssues();
      let msgTemplate: MsgTemplate;

      if (num_issues === 0) {
        msgTemplate = 'BOT_ISSUES_NONE';
      } else if (num_issues < 4) {
        msgTemplate = 'BOT_ISSUES_FEW';
      } else {
        msgTemplate = 'BOT_ISSUES_MANY';
      }

      resolve({ msgTemplate, msgArgs: { num_issues: `${num_issues}` } });
    });
  }
};

/** ======== Middleware function takes action
 *  --> dispatches an action that returns a message
 *
 */
export function initActionHandler(db: myDB) {
  const dispatcher = initDispatcher(actionHandlerMap);

  return async (req: IZulipRequestWithMessage, res, next) => {
    // Case: errors are already present, skip the dispatcher middleware
    // Case: no action specified, skip this middleware
    if (
      req.locals.errors.length !== 0 ||
      req.locals.action.actionType === null
    ) {
      return next();
    }

    const userEmail = req.locals.user.email;
    const { actionType, actionArgs } = req.locals.action;
    const ctx = {
      db,
      userEmail,
      user: req.locals.user.data
    };
    const { msgTemplate, msgArgs } = await dispatcher(
      ctx,
      actionType,
      actionArgs.rawInput,
      req.body
    );

    req.locals.msg = {
      msgTemplate,
      msgArgs,
      sendTo: userEmail
    };

    next();
  };
}

/** ==== more testable dispatcher ====
 *
 * @param ctx
 * @param MapActionToFn
 */
export function initDispatcher(
  MapActionToFn: ActionHandlerMap
): (
  ctx: ICtx,
  action: Action,
  actionArgs: any[],
  zulipBody: ZulipBody
) => Promise<IMsg> {
  return async function dispatcher(ctx, action, actionArgs, zulipBody) {
    const actionfn = MapActionToFn[action];

    // Note: these actions are not coded for async action! but we can just wrap with async & await
    try {
      const messageTemplate = await actionfn(ctx, actionArgs, zulipBody);
      return messageTemplate;
    } catch (e) {
      console.warn(`Error trying to dispatch an action: ${action}`);
      return {
        msgTemplate: 'ERROR',
        msgArgs: { errorMessage: e }
      };
    }
  };
}
