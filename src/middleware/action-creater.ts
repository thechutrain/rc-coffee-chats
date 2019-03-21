/** ==== middleware for creating an action from cli/command
 * takes a req.local.cli --> creates an action
 */

import * as types from '../types';

export function actionCreater(req: types.IZulipRequest, res, next) {
  const { isRegistered, email } = req.local.user;
  let actionType: types.Action | null = null;
  // Case: not registered user
  if (!isRegistered) {
    const wantsToSignUp = req.body.data.match(/signup/gi);
    actionType = wantsToSignUp
      ? types.Action.REGISTER
      : types.Action.PROMPT_SIGNUP;
  } else {
    try {
      actionType = getAction(req.local.cmd);
    } catch (e) {
      req.local.errors.push({
        errorType: types.Errors.NO_VALID_ACTION,
        customMessage: e
      });
      next();
      return;
    }
  }

  // TODO: save args as key-values in action!
  req.local.action = {
    type: actionType,
    currentUser: email,
    args: {
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

// NOTE: will never return null action, by default will return HELP action
export function getAction(cli: types.IParsedCmd): types.Action {
  const command = cli.subcommand
    ? `${cli.directive}_${cli.subcommand}`
    : `${cli.directive}`;

  if (!(command in types.Action) && command === '') {
    console.log('this should be an error');
    throw new Error(
      `Unrecognized command: ${command} \nCould not create a valid action`
    );
  } else if (command in types.Action) {
    return types.Action[command];
  } else {
    return types.Action.SHOW_HELP;
  }
}
