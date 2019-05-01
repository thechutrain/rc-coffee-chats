/** ==== middleware for creating an action from cli/command
 * takes a req.local.cli --> creates an action
 */

import * as types from '../types';

export function actionCreater(req: types.IZulipRequest, res, next) {
  const { isRegistered, isActive } = req.local.user;
  let actionType: types.Action | null = null;

  // Case: Handle if user is not registered or is not active
  if (!isRegistered) {
    const wantsToSignUp = req.body.data.match(/signup/gi);
    actionType = wantsToSignUp
      ? types.Action.__REGISTER
      : types.Action.__PROMPT_SIGNUP;

    req.local.action = {
      actionType,
      actionArgs: {
        rawInput: {}
      }
    };

    return next();
  } else if (!isActive) {
    const wantsToActivate = req.body.data.match(/activate/gi);
    actionType = wantsToActivate
      ? types.Action.__ACTIVATE
      : types.Action.__PROMPT_ACTIVATE;

    req.local.action = {
      actionType,
      actionArgs: {
        rawInput: {}
      }
    };

    return next();
  }

  // Special Case: where users enters a command that does not follow
  // conventional DISPATCH__SUBCOMMAND action.
  const actionFromRegex = getActionFromRegex(req.body.data);
  if (actionFromRegex !== null) {
    req.local.action = actionFromRegex;
  } else {
    // DEFAULT: creation of action
    try {
      actionType = getActionFromCli(req.local.cmd);
    } catch (e) {
      actionType = null;

      req.local.errors.push({
        errorType: types.Errors.NO_VALID_ACTION,
        customMessage: e
      });
    }

    req.local.action = {
      actionType,
      actionArgs: {
        rawInput: req.local.cmd.args
      }
    };
  }

  next();
}

/**
 *
 * @param body
 */
type keyArgs = {
  keyWords: string[];
  actionArgs: {
    rawInput: any;
  };
};

/** getActionFromAlias()
 *  - creates ActionObj from aliased commands
 *
 * @param body
 */
// ✅ Tests Written
export function getActionFromAlias(body: string): types.IActionObj {
  const actionToStrMap: Partial<Record<types.Action, keyArgs>> = {
    [types.Action.BOT__HI]: {
      keyWords: ['hi', 'hello', 'howdy', 'hey', 'sup'],
      actionArgs: {
        rawInput: {}
      }
    },
    [types.Action.UPDATE__SKIP]: {
      keyWords: ['cancel next match', 'cancel', 'skip'],
      actionArgs: {
        rawInput: ['TRUE']
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

/** parseContentAsCli()
 * - parsers content into a CLI object format
 *
 * @param messageContent
 */
export function parseContentAsCli(messageContent: string): types.IParsedCmd {
  const trimmedContent = messageContent.replace(/^\s+|\s+$|^\//g, '');

  const tokenizedArgs = trimmedContent
    .split(/[\s]+/)
    .filter(token => token !== '')
    .map(word => word.toUpperCase());

  return {
    directive: tokenizedArgs.length > 0 ? tokenizedArgs[0] : null,
    subcommand: tokenizedArgs.length > 1 ? tokenizedArgs[1] : null,
    args: tokenizedArgs.length > 2 ? tokenizedArgs.slice(2) : []
  };
}

/**
 * Parses the CLI to create an action.
 * NOTE: will never return null action, by default will return HELP action
 * @param cli
 */
// TODO: this should return an ActionObj, instead of just an action.
// so its similar to getActionFromRegex
export function getActionFromCli(cli: types.IParsedCmd): types.Action {
  // TODO:
  // If user only has subcommand && subcommand = show, update --> change the action

  // DEFAULT ACTION creator:
  const command = cli.subcommand
    ? `${cli.directive}__${cli.subcommand}`
    : `${cli.directive}`;

  if (!(command in types.Action) && command !== '') {
    throw new Error(
      `Unrecognized command: ${command} \nCould not create a valid action`
    );
  } else if (command in types.Action) {
    return types.Action[command];
  } else {
    return types.Action.HELP;
  }
}

export function isAnAliasCommand(rawMessage: string): boolean {
  const regexForwardSlash = /^\//gi;
  return !regexForwardSlash.test(rawMessage);
}

export function createAction(rawMessage: string) {
  // if (isAnAliasCommand(rawMessage)) {

  // }
  return rawMessage;
}
