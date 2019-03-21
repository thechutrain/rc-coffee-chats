////////////////////////////
// Request
////////////////////////////
export interface ILocalsReq extends Express.Request {
  body: any;
  local?: any;
}
export interface IZulipRequest extends Express.Request {
  body: any;
  local: {
    user: {
      email: string;
      isRegistered: boolean;
      // is admin?
    };
    cmd: IParsedCmd;
    action: IActionObj;
    errors: IError[];
    sqlResult?: any;
    msgInfo: IMsgInfo;
  };
}

export interface IError {
  errorType: Errors;
  customMessage?: string;
}

////////////////////////////
// Cli
////////////////////////////
export enum CliDirectives {
  UPDATE = 'UPDATE',
  STATUS = 'STATUS',
  HELP = 'HELP'
}

export interface IParsedCmd {
  directive: string | null;
  subcommand: string | null;
  args: string[];
}

// export interface IValidatedCmd extends IParsedCmd {
//   isValid: boolean;
//   action: Action | null;
//   currentUser: string;
//   targetUser: string;
// }

////////////////////////////
// Dispatch, Action, Commands
////////////////////////////
// NOTE: Most actions are created by joining [FIRST_CMD]__[SECOND_COMMAND]
// Exceptions are: PROMPT_SIGNUP && REGISTER
export enum Action {
  'PROMPT_SIGNUP' = 'PROMPT_SIGNUP',
  'REGISTER' = 'REGISTER',
  // 'UPDATE_DAYS' = 'UPDATE_DAYS',

  // 'UPDATE_SKIP' = 'UPDATE_SKIP',
  // 'UPDATE_WARNINGS' = 'UPDATE_WARNINGS',
  // 'UPDATE_ACTIVE' = 'UPDATE_ACTIVE',
  // ===== NOTE: change status to show!

  // 'SHOW_DAYS' = 'SHOW_DAYS',

  // 'SHOW_PREV' = 'SHOW_PREV',
  // 'SHOW_SKIP' = 'SHOW_SKIP',
  // 'SHOW_WARNINGS' = 'SHOW_WARNINGS',
  'HELP' = 'HELP'
}

export interface IActionObj {
  actionType: Action | null;
  originUser: string;
  actionArgs?: any;
  targetUser?: string;
}

// export interface IReqArg {
//   name: string;
//   type: string;
// }

// TODO: rethink how to shape the action handler:
/**
 * reqKeys: must have these keys, && each key needs to pass this validator
 */

export interface IActionRules {
  okMsg: {
    msgTemplate: msgTemplate;
    reqArgs?: any; // Note: hard to card code what fn => any must contain. So will check dynamically
  };
  fn?: (
    ctx: { db: any; originUser: string; targetUser?: string },
    actionArgs: any
  ) => any;
  errMsg?: {
    msgTemplate: msgTemplate;
    reqArgs?: any;
  };
}

export type ActionHandlerMap = Record<keyof typeof Action, IActionRules>;

// export interface IActionHandler {
//   fn: string;
//   reqArgs?: IReqArg[];
//   // okMsg?: okMsg;
//   // errMsg?: errMsg;
// }

// export type ActionHandlerMap = Record<keyof typeof Action, IActionHandler>;

////////////////////////////
// Dispatch Results
////////////////////////////
// export interface IDispatchArgs {
//   currentUser: string;
//   targetUser: string;
//   userInput?: any;
// }

////////////////////////////
// Messaging
////////////////////////////

export interface IMsg {
  msgTemplate: msgTemplate;
  msgArgs: any;
}
export interface IMsgInfo extends IMsg {
  sendTo: string;
}

// Required Variables & Types for each msg type
// TODO: add-in the required variable types
// type msgTypeEnum = {
//   [k in okMsg]: {
//     reqVars: string[];
//   }
// };

export enum msgTemplate {
  'PROMPT_SIGNUP' = 'PROMPT_SIGNUP',
  'SIGNED_UP' = 'SIGNED_UP',

  // CLI Update-related cmds
  // 'UPDATED_DAYS' = 'UPDATED_DAYS',
  // 'UPDATED_SKIP' = 'UPDATED_SKIP',
  // 'UPDATED_WARNINGS' = 'UPDATED_WARNINGS',

  // CLI Get-related cmds
  // 'STATUS' = 'STATUS',
  // 'STATUS_DAYS' = 'STATUS_DAYS',
  // 'STATUS_SKIP' = 'STATUS_SKIP',
  // 'STATUS_WARNINGS' = 'STATUS_WARNINGS',

  // HELP
  // 'HELP_UPDATE' = 'HELP_UPDATE',
  // 'HELP_STATUS' = 'HELP_STATUS',
  'HELP' = 'HELP',

  // Error
  'ERROR' = 'ERROR'
}

export type msgCreaterMap = Record<
  keyof typeof msgTemplate,
  { template: string; reqVars?: any }
>;

// REMOVE THIS:
export enum Errors {
  'NOT_VALID_DIRECTIVE' = 'NOT_VALID_DIRECTIVE',
  'NOT_VALID_COMMAND' = 'NOT_VALID_COMMAND', // overlap?
  'COULD_NOT_VALIDATE_ACTION' = 'COULD_NOT_VALIDATE_ACTION',
  'NO_VALID_ACTION' = 'NO_VALID_ACTION',
  'DISPATCH_ACTION_DOES_NOT_EXIST' = 'DISPATCH_ACTION_DOES_NOT_EXIST',
  'NOPE' = 'NOPE' // TODO: temp
}
