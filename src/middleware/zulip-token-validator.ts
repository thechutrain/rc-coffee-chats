import * as types from '../types';

export function zulipTokenValidator(req: types.IZulipRequest, res, next) {
  if (req.body.token !== process.env.ZULIP_BOT_TOKEN) {
    req.local.errors.push({
      errorType: types.Errors.INVALID_ZULIP_TOKEN
    });
  }

  next();
}
