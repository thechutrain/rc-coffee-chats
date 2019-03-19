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
    cli?: IParsedCli;
    errors: IError[];
    sqlResult?: any;
    msgInfo?: any;
  };
}

export interface IError {
  msgType: ErrorMessages;
  customMessage: string;
}

//////////////
// Cli
//////////////
export enum CliDirectives {
  UPDATE = 'UPDATE',
  STATUS = 'STATUS',
  HELP = 'HELP'
}

export interface IParsedCli {
  directive: string | null;
  subcommand: string | null;
  args: string[];
}

export interface IValidatedCli extends IParsedCli {
  isValid: boolean;
}

// export enum StatusSubCmds {
//   'days' = 'days',
//   'all' = 'all'
// }

//////////////
// Messaging
//////////////
// TODO: remove from msgSender
export enum msgType {
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

export enum ErrorMessages {
  'NOT_VALID_DIRECTIVE' = 'NOT_VALID_DIRECTIVE'
}
