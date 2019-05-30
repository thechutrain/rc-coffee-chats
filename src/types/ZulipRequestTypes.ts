import { IError } from './ErrorTypes';
import { UserRecord } from './DbTypes';
import { IAction } from './actionTypes';

type currUser = {
  email: string;
  isRegistered: boolean;
  isActive: boolean;
  isAdmin: boolean;
  data?: UserRecord;
};

export interface IBaseZulip extends Express.Request {
  locals: {
    errors: IError[];
  };
  body: {
    data: string;
    token: string;
    bot_email: string;
    message: {
      sender_id: number;
      sender_full_name: string;
      content: string;
      sender_email: string;
      subject: string;
      display_recipient: any[]; // type has email, full_name etc.
    };
  };
}

export interface IZulipRequestWithUser extends IBaseZulip {
  locals: {
    errors: IError[];
    user: currUser;
  };
}

export interface IZulipRequestWithAction extends IBaseZulip {
  locals: {
    errors: IError[];
    user: currUser;
    action: IAction;
  };
}
