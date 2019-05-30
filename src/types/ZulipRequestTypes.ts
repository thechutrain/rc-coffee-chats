import { IError } from './ErrorTypes';

export interface IBaseZulip extends Express.Request {
  locals: {
    errors: IError[];
  };
  body: {
    data: string;
    token: string;
    bot_email: string;
    message: {
      message: {
        sender_id: number;
        sender_full_name: string;
        content: string;
        sender_email: string;
        subject: string;
        display_recipient: any[]; // type has email, full_name etc.
      };
    };
  };
}

// export interface IZulipRequestWithUser {}
