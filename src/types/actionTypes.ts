import { ZulipBody } from './zulipRequestTypes';
import { IMsg } from './msgTypes';
import { myDB, UserRecord } from './DbTypes';

// NOTE: using an Action Enum as oppposed to a type since
// we are checking later if a string exists as an Action key
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

export interface IAction {
  actionType: Action;
  actionArgs: {
    rawInput: any;
  };
}

type keyArgs = {
  keyWords: string[];
  actionType: Action;
  actionArgs: {
    rawInput: any;
  };
};

export type ActionAliasMap = Partial<Record<Action, keyArgs>>;

export type ActionHandlerMap = Record<keyof typeof Action, actionFn>;
export type actionFn = (
  ctx: ICtx,
  actionArgs: string[],
  zulipBody: ZulipBody
) => Promise<IMsg>;

export interface ICtx {
  db: myDB;
  userEmail: string;
  user?: UserRecord;
}
