import { IError } from './ErrorTypes';
import { UserRecord } from './DbTypes';
import { IAction } from './actionTypes';
import { Msg } from './MsgTypes';

type currUser = {
  email: string;
  isRegistered: boolean;
  isActive: boolean;
  isAdmin: boolean;
  data?: UserRecord;
};

export type ZulipBody = {
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

export interface IBaseZulip extends Express.Request {
  locals: {
    errors: IError[];
  };
  body: ZulipBody;
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

export interface IZulipRequestWithMessage extends IBaseZulip {
  locals: {
    errors: IError[];
    user: currUser;
    action: IAction;
    msg: Msg;
  };
}
