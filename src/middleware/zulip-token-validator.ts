import { IBaseZulip } from '../types/ZulipRequestTypes';

export function zulipTokenValidator(req: IBaseZulip, res, next) {
  if (req.body.token !== process.env.ZULIP_BOT_TOKEN) {
    req.locals.errors.push({
      errorType: 'INVALID_ZULIP_TOKEN'
    });
  }
  next();
}
