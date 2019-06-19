/** ==== middleware for creating an action from cli/command
 * takes a req.locals.cli --> creates an action
 */

import * as types from '../types';
import { IZulipRequestWithAction } from '../types/zulipRequestTypes';
import { Action, IAction, ActionAliasMap } from '../types/actionTypes';

export function actionCreater(req: IZulipRequestWithAction, res, next) {
  if (req.locals.errors && req.locals.errors.length) {
    return next();
  }

  const { isRegistered, isActive } = req.locals.user;
  let actionType: Action;

  /** HANDLE SPECIAL CASES:
   * - Case 1: user has never been registered with Chat Bot
   * - Case 2: returning user who needs to reactivate their account
   */
  if (!isRegistered) {
    const wantsToSignUp = req.body.data.match(/signup/gi);
    actionType = wantsToSignUp ? Action.__REGISTER : Action.__PROMPT_SIGNUP;

    req.locals.action = {
      actionType,
      actionArgs: {
        rawInput: {}
      }
    };

    return next();
  } else if (!isActive) {
    const wantsToActivate = req.body.data.match(/activate/gi);
    actionType = wantsToActivate ? Action.__ACTIVATE : Action.__PROMPT_ACTIVATE;

    req.locals.action = {
      actionType,
      actionArgs: {
        rawInput: {}
      }
    };

    return next();
  }

  // Normal Action Creation, via: alias or full CLI
  try {
    req.locals.action = createAction(req.body.data);
  } catch (e) {
    req.locals.errors.push({
      errorType: 'NO_VALID_ACTION',
      customMessage: e
    });
  }

  next();
}

/** createAction()
 * - attempts to create an ActionObject from given string input
 * - will throw an error if it cannot make a valid action!
 */
export function createAction(rawMessage: string): IAction {
  // SITUATION: strict use of "/" for all the full commands
  // return isAnAliasCommand(rawMessage)
  //   ? getActionFromAlias(rawMessage)
  //   : getActionFromCli(rawMessage);

  // TEMP: backward compatibility, support the v2 syntax of update without requiring backlash
  let failedAlias = false;
  if (isAnAliasCommand(rawMessage)) {
    try {
      const actionObj = getActionFromAlias(rawMessage);
      return actionObj;
    } catch (e) {
      failedAlias = true;
    }
  }

  try {
    const actionObj = getActionFromCli(rawMessage);
    return actionObj;
  } catch (e) {
    if (failedAlias) {
      throw new Error(
        `Could not find an alias or full cli action for ${rawMessage}`
      );
    } else {
      throw new Error(e);
    }
  }
}

/** parseContentAsCli()
 * - parsers content into a CLI object format
 *
 * @param messageContent
 */
// ✅ Tests Written
export function parseContentAsCli(messageContent: string) {
  const trimmedContent = messageContent.replace(/^\s+|\s+$|^\//g, '');

  const tokenizedArgs = trimmedContent
    .split(/[\s]+/)
    .filter(token => token !== '')
    .map((word, index) => (index < 2 ? word.toUpperCase() : word));

  return {
    directive: tokenizedArgs.length > 0 ? tokenizedArgs[0] : null,
    subcommand: tokenizedArgs.length > 1 ? tokenizedArgs[1] : null,
    args: tokenizedArgs.length > 2 ? tokenizedArgs.slice(2) : []
  };
}

/** getActionFromCli()
 *  -
 * Parses the CLI to create an action.
 * NOTE: will never return null action, by default will return HELP action
 * @param cli
 */
export function getActionFromCli(messageContent: string): IAction {
  const cli = parseContentAsCli(messageContent);

  const actionStr = cli.subcommand
    ? `${cli.directive}__${cli.subcommand}`
    : `${cli.directive}`;

  if (!(actionStr in types.Action) && actionStr !== '') {
    throw new Error(
      `Unrecognized command: ${actionStr} \nCould not create a valid action`
    );
  }

  const actionType = actionStr in Action ? Action[actionStr] : Action.HELP;

  return {
    actionType,
    actionArgs: { rawInput: cli.args }
  };
}

/** getActionFromAlias()
 *  - creates ActionObj from aliased commands
 *
 * @param body
 */
// ✅ Tests Written
export function getActionFromAlias(body: string): IAction {
  const actionToStrMap: ActionAliasMap = {
    [Action.BOT__HI]: {
      keyWords: ['hi', 'hello', 'howdy', 'hey', 'sup'],
      actionType: Action.BOT__HI,
      actionArgs: {
        rawInput: {}
      }
    },
    [Action.UPDATE__SKIP]: {
      keyWords: ['cancel next match', 'cancel', 'skip'],
      actionType: Action.UPDATE__SKIP,
      actionArgs: {
        rawInput: ['true']
      }
    },
    [Action.SHOW__DAYS]: {
      keyWords: ['days'],
      actionType: Action.SHOW__DAYS,
      actionArgs: {
        rawInput: []
      }
    },
    [Action.UPDATE__ACTIVE]: {
      keyWords: ['deactivate', 'freeze'],
      actionType: Action.UPDATE__ACTIVE,
      actionArgs: {
        rawInput: ['false']
      }
    }
  };

  for (const action in actionToStrMap) {
    // NOTE: want to check that messages match exactly from start to end:
    const keyWordsArray = actionToStrMap[action].keyWords.join('$|^');
    const regex = new RegExp(`^${keyWordsArray}$`, 'gi');
    if (regex.test(body)) {
      return {
        actionType: types.Action[action],
        actionArgs: actionToStrMap[action].actionArgs
      };
    }
  }

  throw new Error(`Could not find an alias command for : "${body}"`);
}

export function isAnAliasCommand(rawMessage: string): boolean {
  const regexForwardSlash = /^\//gi;
  return !regexForwardSlash.test(rawMessage);
}
