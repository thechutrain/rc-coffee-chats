/** ==== middleware for creating an action from cli/command
 * takes a req.local.cli --> creates an action
 */

import * as types from '../types';

export function actionCreater(req: types.IZulipRequest, res, next) {
  const { isRegistered, email } = req.local.user;
  let actionType: types.Action | null = null;
  const justGreetingMe =
    req.body.data.match(/hi/gi) ||
    req.body.data.match(/hello/gi) ||
    req.body.data.match(/hey/gi) ||
    req.body.data.match(/howdy/gi) ||
    req.body.data.match(/sup/gi);

  // Case: not registered user
  if (!isRegistered) {
    const wantsToSignUp = req.body.data.match(/signup/gi);
    actionType = wantsToSignUp
      ? types.Action.__REGISTER
      : types.Action.__PROMPT_SIGNUP;
  } else if (justGreetingMe) {
    actionType = types.Action.BOT__HI;
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
  }

  req.local.action = {
    actionType,
    // TODO: save args as key-values in action!
    actionArgs: {
      rawInput: req.local.cmd.args
    }
  };

  // ==== DEBUG ====
  // console.log('========= START of actionCreater middleware ==========');
  // console.log('req.local.action: ');
  // console.log(req.local.action);
  // console.log('========= END of actionCreater middleware ==========\n\n');
  next();
}

/**
 *
 * @param body
 */
export function getActionFromRegex(body: string): types.Action | null {
  const stringsToMap: Partial<Record<types.Action, string[]>> = {
    [types.Action.BOT__HI]: ['hi', 'hello', 'howdy', 'hey', 'sup'],
    [types.Action.UPDATE__SKIP]: ['cancel next match']
  };

  const inputString = body.toLowerCase();

  for (const action in stringsToMap) {
    const keyWordsArray = stringsToMap[action].join('|');
    const regex = new RegExp(keyWordsArray, 'gi');
    if (regex.test(body)) {
      return types.Action[action];
    }
  }

  return null;
}

/**
 * Parses the CLI to create an action.
 * NOTE: will never return null action, by default will return HELP action
 * @param cli
 */
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
