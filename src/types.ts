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
// Cli
//////////////
export interface IParsedCli {
  directive: string | null;
  subcommand: string | null;
  args: string[];
}

export interface IValidatedCli extends IParsedCli {
  isValid: boolean;
}
