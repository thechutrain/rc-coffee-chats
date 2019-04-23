/** ==== middleware for creating an action from cli/command
 * takes a req.local.cli --> creates an action
 */

import * as types from '../types';

export function actionCreater(req: types.IZulipRequest, res, next) {
  const { isRegistered, email } = req.local.user;
  // TEMP:
  const isActive = true;
  let actionType: types.Action | null = null;

  // Case: Handle if user is not registered or is not active
  if (!isRegistered) {
    const wantsToSignUp = req.body.data.match(/signup/gi);
    actionType = wantsToSignUp
      ? types.Action.__REGISTER
      : types.Action.__PROMPT_SIGNUP;

    req.local.action = {
      actionType,
      actionArgs: {}
    };
    next();
  } else if (!isActive) {
    // TODO: implement this!
  }

  // Special Case: where users enters a command that does not follow
  // conventional DISPATCH__SUBCOMMAND action.
  const actionFromCli = getActionFromRegex(req.body.data);
  if (actionFromCli !== null) {
    req.local.action = actionFromCli;
    next();
  }

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
export function getActionFromRegex(body: string): types.IActionObj | null {
  // TODO: rename this variable: stringsToMap
  const stringsToMap: Partial<Record<types.Action, keyArgs>> = {
    [types.Action.BOT__HI]: {
      keyWords: ['hi', 'hello', 'howdy', 'hey', 'sup'],
      actionArgs: {
        rawInput: {}
      }
    },
    [types.Action.UPDATE__SKIP]: {
      keyWords: ['cancel next match'],
      actionArgs: {
        rawInput: ['TRUE']
      }
    }
  };

  for (const action in stringsToMap) {
    const keyWordsArray = stringsToMap[action].keyWords.join('|');
    const regex = new RegExp(keyWordsArray, 'gi');
    if (regex.test(body)) {
      return {
        actionType: types.Action[action],
        actionArgs: stringsToMap[action].actionArgs
      };
    }
  }

  return null;
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
