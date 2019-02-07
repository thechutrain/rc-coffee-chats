import { WEEKDAYS } from '../constants';

///////////////////////////
// General DB Responses
//////////////////////////
// TODO: Make General DB Responses
// interface ISuccessHandler {
//   log: boolean;
//   sendMessage?: boolean;
//   messageType: string;
//   messageBody:
// }

//////////////////////
// General Sql Responses
//////////////////////

interface ISqlResponse {
  status: 'OK' | 'FAILURE';
  payload?: any;
}

export interface ISqlOk extends ISqlResponse {
  payload?: any;
}
export interface ISqlError extends ISqlResponse {
  message: string;
}

// interface IDBMethods {
//   user: IUserTableMethods;
//   match: any; // TODO: update type
//   // createMatchTable: () => ISqlResponse;
//   closeDb: () => ISqlResponse;
// }

//////////////////////
// Users Model
//////////////////////
export interface IAddUserArgs {
  email: string;
  full_name: string;
  coffee_days?: string; // string of numbers TODO: fix this in the addUser fn
  // coffee_days?: WEEKDAYS[];
}

export interface IUpdateUserArgs {
  skip_next_match?: boolean;
  warning_exception?: boolean;
  coffee_days?: string;
  // ==== Admin features? ===
  is_active?: boolean;
  is_faculty?: boolean;
  is_at_rc?: boolean;
  is_alum?: boolean;
}

type truthy = boolean | number;

export interface IUserDB {
  id: number;
  email: string;
  full_name: string;
  coffee_days: string; // coffee_days into an enum
  skip_next_match: truthy;
  warning_exception: truthy;
  is_active: truthy; // Whether they will get any matches or not
  is_faculty: truthy;
  is_alum: truthy;
  // is_admin: truthy; // admin has ability to change other user settings & view logs
  // in_session: truthy; // Will Deprecate Later
}

interface IPrevMatch {
  user_id: number;
  date: string | Date;
}

export interface IUserMatchResult extends IUserDB {
  prevMatches: IPrevMatch[];
}

// export interface IUserTableMethods {
//   // _dropTable: () => ISqlResponse;
//   createTable: () => ISqlResponse; // can I make this chainable?
//   count: () => number;
//   // NOTE: ultimately want to make this find flexible
//   find: (email: string, optCols?: string) => IUserDB;
//   getUsersByCoffeeDay: any;
//   // findUserMatch: (email: string) => IUserSqlResponse;
//   add: (IAddUserArgs) => ISqlResponse;
//   update: (targetEmail: string, opts: IUpdateUserArgs) => IUserSqlResponse;
// }

//////////////////////
// Match Model
//////////////////////
export interface IAddMatchArgs {
  user_1_id: number;
  user_2_id: number;
  date?: string;
}

export interface IMatchDB {
  match_id: number;
  user_1_id: number;
  user_2_id: number;
  date: string;
}
