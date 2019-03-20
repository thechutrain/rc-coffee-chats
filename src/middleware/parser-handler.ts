/** ==== Middleware fn creates action ====
 * Parsers zulip messages:
 * This module is responsible for handling all commands
 * sent from bot/zulip server --> our server
 */

import * as types from '../types';

/** CLI parser middleware
 *
 * @param req
 * @param res
 * @param next
 */
export function parserHandler(req: types.IZulipRequest, res, next) {
  const {
    message: { content }
  } = req.body;

  req.local.cli = simpleParser(content);
  console.log('===== END of parser-handler middleware ====');
  next();
  return;
}

export function _parseContent(messageContent: string): types.IParsedCmd {
  const trimmedContent = messageContent.replace(/^\s+|\s+$/g, '');

  const tokenizedArgs = trimmedContent
    .split(/[\s]+/)
    .filter(token => token !== '')
    .map(word => word.toUpperCase());

  return {
    directive: tokenizedArgs.length > 0 ? tokenizedArgs[0] : null,
    subcommand: tokenizedArgs.length > 1 ? tokenizedArgs[1] : null,
    args: tokenizedArgs.length > 2 ? tokenizedArgs.slice(2) : []
  };
}
