/** ==== middleware for creating an action from cli/command
 * takes a req.local.cli --> creates an action
 */

import * as types from '../types';

export function actionCreater(req: types.IZulipRequest, res, next) {
  console.log('========= START of actionCreater middleware ==========');
  // Case: not registered user
  // 1) prompt signup
  // 2) signup user

  // Case: registered user
  // 1) valid command
  // 2) not valid command
  req.local.action = {
    type: null,
    currentUser: req.local.user.email
  };
  console.log('========= END of actionCreater middleware ==========');
  next();
}
