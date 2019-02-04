//////////////////////
// General Sql Responses
//////////////////////
// TODO: make a SQL error object?

export interface ISqlResponse {
  status: 'SUCCESS' | 'FAILURE';
  message?: string;
  payload?: any; // valid model?
}

export interface ISqlError {
  status: 'FAILURE';
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
  user_id: number;
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
