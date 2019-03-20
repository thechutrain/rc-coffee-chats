//////////////
// Request
//////////////
export interface ILocalsReq extends Express.Request {
  body: any;
  local?: any;
}
export interface IZulipRequest extends Express.Request {
  body: any;
  local: {
    user?: {
      email: string;
    };
    cli?: IValidatedCmd;
    errors: IError[];
    sqlResult?: any;
    msgInfo?: IMsg;
  };
}

export interface IError {
  errorType: ErrorTypes;
  customMessage?: string;
}

//////////////
// Cli
//////////////
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

export interface IValidatedCmd extends IParsedCmd {
  isValid: boolean;
}

//////////////
// Commands
//////////////
export enum Commands {
  'UPDATE_DAYS' = 'UPDATE_DAYS',
  // 'UPDATE_SKIP' = 'UPDATE_SKIP',
  // 'UPDATE_WARNINGS' = 'UPDATE_WARNINGS',
  // 'UPDATE_ACTIVE' = 'UPDATE_ACTIVE',
  // ===== NOTE: change status to show!
  'STATUS_DAYS' = 'STATUS_DAYS',
  // 'STATUS_PREV' = 'STATUS_PREVg',
  // 'STATUS_SKIP' = 'STATUS_SKIP',
  // 'STATUS_WARNINGS' = 'STATUS_WARNINGS',
  'HELP' = 'HELP'
}

export interface IReqArg {
  name: string;
  type: string;
}
export interface IActionHandler {
  function: string;
  reqArgs: IReqArg[];
  onSuccessMsg: okMessages;
}

export type CommandToAction = Record<keyof typeof Commands, IActionHandler>;

//////////////
// Messaging
//////////////
// TODO: remove from msgSender
export interface IMsg {
  sendToEmail: string;
  msgType: okMessages | ErrorMessages;
  msgArgs?: any;
}

export enum okMessages {
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
  'HELP' = 'HELP',

  // ERROR
  'ERROR' = 'ERROR'
}

export enum ErrorTypes {
  'NOT_VALID_DIRECTIVE' = 'NOT_VALID_DIRECTIVE',
  'NOT_VALID_COMMAND' = 'NOT_VALID_COMMAND', // overlap?
  'FAILED_DISPATCHED_ACTION' = 'FAILED_DISPATCHED_ACTION'
}
