//////////////
// Request
//////////////
export interface IZulipRequest extends Express.Request {
  body: any;
  local?: {
    user?: {
      email: string;
    };
    cli?: any;
    errors?: any;
    sqlResult?: any;
    msgInfo?: any;
  };
}

//////////////
// Cli Action
//////////////
export interface ICliAction {
  test: boolean;
}
