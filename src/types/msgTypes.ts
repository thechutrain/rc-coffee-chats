export type Msg = {
  msgTemplate: MsgTemplate;
  sendTo: string[] | string;
  msgArgs?: Record<any, string>;
};

export interface IMsg {
  msgTemplate: MsgTemplate;
  msgArgs?: Record<any, string>;
}

export type MsgCreaterMap = Record<
  MsgTemplate,
  {
    template: string;
    reqVars?: string[];
  }
>;

export type MsgTemplate =
  | 'BLANK'
  | 'PROMPT_SIGNUP'
  | 'SIGNED_UP'
  | 'PROMPT_ACTIVATE'
  | 'ACTIVATE'
  | 'DEACTIVATE'

  // CLI Update-related cmds
  | 'UPDATED_GENERAL'
  | 'UPDATED_DAYS'
  | 'UPDATED_FALLBACK'
  | 'STATUS_DAYS'
  | 'STATUS_SKIPPING'
  | 'STATUS_NOT_SKIPPING'
  | 'STATUS_WARNINGS_ON'
  | 'STATUS_WARNINGS_OFF'
  | 'STATUS_PREVIOUS_MATCHES'
  | 'STATUS_FALLBACK'
  | 'STATUS_FALLBACK_NULL'

  // HELP
  | 'HELP'
  | 'HELP_SHOW'
  | 'HELP_UPDATE'

  // CHRON Messags:
  | 'YOUR_MATCH'

  // BOT-related messages:
  | 'BOT_ISSUES_MANY'
  | 'BOT_ISSUES_FEW'
  | 'BOT_ISSUES_NONE'
  | 'BOT_STATS'
  | 'BOT_USERS'

  // Error
  | 'ERROR'

  // Cron-related:
  | 'WARNING_NOTIFICATION'
  | 'TODAYS_MATCH'

  // One-off Messages:
  | 'ONBOARDING'
  | 'OFFBOARDING';
