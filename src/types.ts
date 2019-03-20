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
    };
    cli: IParsedCmd;
    action: IAction;
    errors: IError[];
    sqlResult?: any;
    msgInfo?: MsgInfo;
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
export enum Action {
  'UPDATE_DAYS' = 'UPDATE_DAYS',
  // 'UPDATE_SKIP' = 'UPDATE_SKIP',
  // 'UPDATE_WARNINGS' = 'UPDATE_WARNINGS',
  // 'UPDATE_ACTIVE' = 'UPDATE_ACTIVE',
  // ===== NOTE: change status to show!
  'SHOW_DAYS' = 'SHOW_DAYS'
  // 'SHOW_PREV' = 'SHOW_PREV',
  // 'SHOW_SKIP' = 'SHOW_SKIP',
  // 'SHOW_WARNINGS' = 'SHOW_WARNINGS',
  // 'HELP' = 'HELP'
}

export interface IAction {
  type: Action | null;
  currentUser: string;
  targetUser: string;
}

export interface IReqArg {
  name: string;
  type: string;
}

// TODO: rethink how to shape the action handler:
/**
 * reqKeys: must have these keys, && each key needs to pass this validator
 */
export interface IActionHandler {
  fn?: string;
  reqArgs?: IReqArg[];
  okMsg: okMsg;
  errMsg?: errMsg;
}

export type ActionHandlerMap = Record<keyof typeof Action, IActionHandler>;

////////////////////////////
// Dispatch Results
////////////////////////////

export interface IDispatchArgs {
  currentUser: string;
  targetUser: string;
  userInput?: any;
}
export type DispatchResult = IOkDispatchResult | IErrorDispatchResult;

export interface IOkDispatchResult {
  status: 'OK';
}
export interface IErrorDispatchResult {
  status: 'ERROR';
  errorMessage: string;
}

////////////////////////////
// Messaging
////////////////////////////
// TODO: remove from msgSender
// interface
export type MsgInfo = IOkMsg | IErrMsg;

export interface IOkMsg {
  sendToEmail: string;
  msgType: okMsg | errMsg;
  msgArgs?: any;
}

export interface IErrMsg {
  sendToEmail: string;
  msgType: errMsg;
  errType: Errors;
}

// Required Variables & Types for each msg type
// TODO: add-in the required variable types
// type msgTypeEnum = {
//   [k in okMsg]: {
//     reqVars: string[];
//   }
// };

export enum okMsg {
  'PROMPT_SIGNUP' = 'PROMPT_SIGNUP',
  'SIGNED_UP' = 'SIGNED_UP',

  // CLI Update-related cmds
  'UPDATED_DAYS' = 'UPDATED_DAYS',
  'UPDATED_SKIP' = 'UPDATED_SKIP',
  'UPDATED_WARNINGS' = 'UPDATED_WARNINGS',

  // CLI Get-related cmds
  'STATUS' = 'STATUS',
  'STATUS_DAYS' = 'STATUS_DAYS',
  'STATUS_SKIP' = 'STATUS_SKIP',
  'STATUS_WARNINGS' = 'STATUS_WARNINGS',

  // HELP
  'HELP_UPDATE' = 'HELP_UPDATE',
  'HELP_STATUS' = 'HELP_STATUS',
  'HELP' = 'HELP'
}

export enum errMsg {
  'GENERIC_ERROR' = 'GENERIC_ERROR'
}

export enum Errors {
  'NOT_VALID_DIRECTIVE' = 'NOT_VALID_DIRECTIVE',
  'NOT_VALID_COMMAND' = 'NOT_VALID_COMMAND', // overlap?
  'COULD_NOT_VALIDATE_ACTION' = 'COULD_NOT_VALIDATE_ACTION',
  'NO_VALID_ACTION' = 'NO_VALID_ACTION',
  'DISPATCH_ACTION_DOES_NOT_EXIST' = 'DISPATCH_ACTION_DOES_NOT_EXIST'
}
