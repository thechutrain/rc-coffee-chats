//////////////
// Request
//////////////
export interface IZulipRequest extends Express.Request {
  body: any;
  local?: {
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
