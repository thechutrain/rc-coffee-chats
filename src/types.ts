////////////////////////////
// Request
////////////////////////////
export interface IZulipBody {
  data: string; // same thing as message.content // TODO: maybe I should only get the data from message.content?
  trigger: string;
  token: string;
  message: {
    sender_id: number;
    sender_full_name: string;
    content: string;
    sender_email: string;
    subject: string;
    display_recipient: any[]; // type has email, full_name etc.
  };
  bot_email: string;
}

export interface ILocalsReq extends Express.Request {
  body: any;
  // TODO: change to locals
  local?: any;
}

// TODO: extend each
// interface IBaseZulip {}
// IZulipRequestWithUser
//

export interface IZulipRequest extends Express.Request {
  body: IZulipBody;
  local: {
    user: {
      email: string;
      isRegistered: boolean;
      isActive: boolean;
      isAdmin: boolean;
      data?: UserRecord;
    };
    action: IActionObj;
    errors: IError[];
    msgInfo: IMsgInfo;
    // TODO: DEPRECATE THIS
  };
}

export interface IError {
  errorType: Errors;
  customMessage?: string;
}

////////////////////////////
// Dispatch, Action, Commands
////////////////////////////
// NOTE: Most actions are created by joining [FIRST_CMD]__[SECOND_COMMAND]
// Exceptions include non-user input generated actions:
// __PROMPT_SIGNUP && __REGISTER
export enum Action {
  '__PROMPT_SIGNUP' = '__PROMPT_SIGNUP',
  '__REGISTER' = '__REGISTER',

  '__ACTIVATE' = '__ACTIVATE',
  '__PROMPT_ACTIVATE' = '__PROMPT_ACTIVATE',

  // === SHOW actions ====
  'SHOW__DAYS' = 'SHOW__DAYS',
  'SHOW__PREVIOUS' = 'SHOW__PREVIOUS',
  'SHOW__SKIP' = 'SHOW__SKIP',
  // 'SHOW__SKIPPING' = 'SHOW__SKIPPING',
  'SHOW__WARNINGS' = 'SHOW__WARNINGS',
  'SHOW__FALLBACK' = 'SHOW__FALLBACK',

  // === UPDATE actions ====
  'UPDATE__DAYS' = 'UPDATE__DAYS',
  'UPDATE__SKIP' = 'UPDATE__SKIP',
  // 'UPDATE__SKIPPING' = 'UPDATE__SKIPPING',
  'UPDATE__WARNINGS' = 'UPDATE__WARNINGS',
  'UPDATE__ACTIVE' = 'UPDATE__ACTIVE',
  'UPDATE__FALLBACK' = 'UPDATE__FALLBACK',

  'HELP' = 'HELP',
  'HELP__SHOW' = 'HELP__SHOW',
  'HELP__UPDATE' = 'HELP__UPDATE',

  // BOT
  'BOT__ISSUES' = 'BOT__ISSUES',
  'BOT__STATS' = 'BOT__STATS',
  'BOT__HI' = 'BOT__HI'
}

export interface IActionObj {
  actionType: Action;
  actionArgs: {
    rawInput: any;
  };
  targetUser?: string;
}

// TODO: rethink how to shape the action handler:
/**
 * reqKeys: must have these keys, && each key needs to pass this validator
 */

import { myDB, UserRecord } from './types/dbTypes';
export { myDB };
export interface ICtx {
  db: myDB;
  userEmail: string;
  user?: UserRecord;
}

export type actionFn = (
  ctx: ICtx,
  actionArgs: string[],
  zulipBody: IZulipBody
) => Promise<IMsg>;
export type ActionHandlerMap = Record<keyof typeof Action, actionFn>;

// type ActionType = 'UPDATE__DATES' | 'SHOW__DAYS';
////////////////////////////
// Messaging
////////////////////////////
export interface IMsg {
  msgTemplate: msgTemplate;
  msgArgs?: Record<any, string>;
}
export interface IMsgInfo extends IMsg {
  sendTo: string;
}
const foo = {
  // bar: 'hello',
  baz: 1
};

function x(y: typeof foo) {}

// x({ baz: 'asdfa' });

export enum msgTemplate {
  'BLANK' = 'BLANK',
  'PROMPT_SIGNUP' = 'PROMPT_SIGNUP',
  'SIGNED_UP' = 'SIGNED_UP',

  'PROMPT_ACTIVATE' = 'PROMPT_ACTIVATE',
  'ACTIVATE' = 'ACTIVATE',
  'DEACTIVATE' = 'DEACTIVATE',

  // CLI Update-related cmds
  'UPDATED_GENERAL' = 'UPDATED_GENERAL',
  'UPDATED_DAYS' = 'UPDATED_DAYS',
  'UPDATED_FALLBACK' = 'UPDATED_FALLBACK',
  // 'UPDATED_SKIP' = 'UPDATED_SKIP',
  // 'UPDATED_WARNINGS' = 'UPDATED_WARNINGS',

  // 'STATUS' = 'STATUS',
  'STATUS_DAYS' = 'STATUS_DAYS',
  'STATUS_SKIP_TRUE' = 'STATUS_SKIP_TRUE',
  'STATUS_SKIP_FALSE' = 'STATUS_SKIP_FALSE',
  'STATUS_WARNINGS_ON' = 'STATUS_WARNINGS_ON',
  'STATUS_WARNINGS_OFF' = 'STATUS_WARNINGS_OFF',
  'STATUS_PREVIOUS_MATCHES' = 'STATUS_PREVIOUS_MATCHES',
  'STATUS_FALLBACK' = 'STATUS_FALLBACK',
  'STATUS_FALLBACK_NULL' = 'STATUS_FALLBACK_NULL',
  // 'STATUS_SKIP' = 'STATUS_SKIP',
  // 'STATUS_SKIP' = 'STATUS_SKIP',
  // 'STATUS_WARNINGS' = 'STATUS_WARNINGS',

  // HELP
  // 'HELP_UPDATE' = 'HELP_UPDATE',
  // 'HELP_STATUS' = 'HELP_STATUS',
  'HELP' = 'HELP',
  'HELP_SHOW' = 'HELP_SHOW',
  'HELP_UPDATE' = 'HELP_UPDATE',

  // CHRON Messags:
  'YOUR_MATCH' = 'YOUR_MATCH',

  // BOT-related messages:
  'BOT_ISSUES_MANY' = 'BOT_ISSUES_MANY',
  'BOT_ISSUES_FEW' = 'BOT_ISSUES_FEW',
  'BOT_ISSUES_NONE' = 'BOT_ISSUES_NONE',
  'BOT_STATS' = 'BOT_STATS',

  // Error
  'ERROR' = 'ERROR',

  // Cron-related:
  'WARNING_NOTIFICATION' = 'WARNING_NOTIFICATION',
  'TODAYS_MATCH' = 'TODAYS_MATCH',

  // One-off Messages:
  'ONBOARDING' = 'ONBOARDING',
  'OFFBOARDING' = 'OFFBOARDING'
}

enum t {
  'appple',
  'pear'
}

export type msgCreaterMapp = Record<
  keyof typeof t,
  // [keyof msgTemplate],
  string
  // { template: string; reqVars?: string[] }
>;

const test: msgCreaterMapp = {
  appple: 'asdfasd',
  pear: 'asdfa'
};

const a = {
  apple: 0,
  0: 'apple'
};

export type msgCreaterMap = Record<
  keyof typeof msgTemplate,
  // [keyof msgTemplate],
  { template: string; reqVars?: string[] }
>;

// REMOVE THIS:
export enum Errors {
  'INVALID_ZULIP_TOKEN' = 'INVALID_ZULIP_TOKEN',
  'FAILED_UPDATE' = 'FAILED_UPDATE',
  'NOT_VALID_DIRECTIVE' = 'NOT_VALID_DIRECTIVE',
  'NOT_VALID_COMMAND' = 'NOT_VALID_COMMAND', // overlap?
  'COULD_NOT_VALIDATE_ACTION' = 'COULD_NOT_VALIDATE_ACTION',
  'NO_VALID_ACTION' = 'NO_VALID_ACTION',
  'DISPATCH_ACTION_DOES_NOT_EXIST' = 'DISPATCH_ACTION_DOES_NOT_EXIST',
  'NOPE' = 'NOPE', // TODO: temp
  'GENERAL' = 'GENERAL'
}

////////////////////////////
// MISC
////////////////////////////
export enum WEEKDAY {
  SUN,
  MON,
  TUE,
  WED,
  THU,
  FRI,
  SAT
}
