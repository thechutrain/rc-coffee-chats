interface IZulipMsgHandler {
  status: 'FAILURE' | 'SUCCESS';
  // Flexilibty for Successful messages
  messageTemplate?: string;
  messageData?: any;
  // Flexibility
  rawMessageString?: string;
}

interface ISqlHandler {
  status: 'SUCCESS' | 'ERROR';
  data?: any;
}
interface ISuccessMsg extends ISqlHandler {
  status: 'SUCCESS';
  messageTemplate: string;
  data: any;
}

interface IErrorMsg extends ISqlHandler {
  status: 'ERROR';
  messageTemplate?: string;
  data: string;
}
