/** ==== middleware for creating an action from cli/command
 * takes a req.local.cli --> creates an action
 */

import * as types from '../types';

export function actionCreater(req: types.IZulipRequest, res, next) {
  console.log('========= START of actionCreater middleware ==========');
  const { isRegistered, email } = req.local.user;
  let actionType: types.Action | null = null;
  // Case: not registered user
  if (!isRegistered) {
    const wantsToSignUp = req.body.data.match(/signup/gi);
    actionType = wantsToSignUp
      ? types.Action.REGISTER
      : types.Action.PROMPT_SIGNUP;
  } else {
    actionType = getAction(req.local.cmd);
  }

  req.local.action = {
    type: actionType,
    currentUser: email
  };

  console.log('req.local.action: ');
  console.log(req.local.action);
  console.log('========= END of actionCreater middleware ==========\n\n');
  next();
}

// NOTE: will never return null action, by default will return HELP action
export function getAction(cli: types.IParsedCmd): types.Action | null {
  const command = cli.subcommand
    ? `${cli.directive}_${cli.subcommand}`
    : `${cli.directive}`;

  if (command in types.Action) {
    return types.Action[command];
  } else {
    return types.Action.SHOW_HELP;
  }
}
