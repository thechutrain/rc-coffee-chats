/**
 * Parsers zulip messages:
 * This module is responsible for handling all commands
 * sent from bot/zulip server --> our server
 */

import * as types from '../types';
import { Util } from '../utils/index';

interface IParsedCli {
  directive: string | null;
  subcommand: string | null;
  args: string[];
}

interface IValidatedCli extends IParsedCli {
  isValid: boolean;
}

/**
 * Given a message string, will try to parse it into directive, subcommand, arguments object
 *
 */
export function simpleParser(messageContent: string): IParsedCli {
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

export function cliParser(req: types.IZulipRequest, res, next) {
  console.log('calling cliParser ...');
  const {
    message: { content }
  } = req.body;
  console.log('CLI PARSER MIDDLEAARE:');
  console.log(content);

  req.local.cli = simpleParser(content);
  next();
}
// TODO: modularize / separate functionality here
// parsing vs. validating
// export function parseZulipServerRequest(
//   zulipRequest: IZulipRequest
// ): ICliAction {
//   const {
//     message: { content, sender_email: senderEmail }
//   } = zulipRequest;
//   const trimmedContent = content.replace(/^\s+|\s+$/g, '');

//   const cliArgumentsArray = trimmedContent
//     .split(/[\s]+/)
//     .map(word => word.toUpperCase());

//   // Case of no content: --> send the default help
//   if (cliArgumentsArray[0] === '') {
//     return {
//       directive: directives.HELP,
//       senderEmail
//     };
//   }

//   ///////////////////////////
//   // Validate Directive
//   ///////////////////////////
//   const directive = cliArgumentsArray[0];
//   const validDirective = Util.valueExistsInEnum(directive, directives);
//   if (!validDirective) {
//     throw new CliError({
//       errorType: 'NOT A VALID DIRECTIVE',
//       message: `Cli parsing Error: first word must be a valid directive.
//       Valid Directives include: UPDATE | STATUS | HELP
//       `,
//       senderEmail
//     });
//   } else if (directive === directives.HELP && cliArgumentsArray.length === 1) {
//     // Generic Help case: args --> HELP
//     return {
//       directive: directives.HELP,
//       senderEmail
//     };
//   } else if (directive === directives.HELP) {
//     const helpSubCommand = HelpSubCommands[cliArgumentsArray[1]] || null;

//     return {
//       directive: directives[directive],
//       subCommand: helpSubCommand,
//       senderEmail
//     };
//   }

//   ///////////////////////////
//   // Validate Commands
//   ///////////////////////////
//   const strSubCmd = cliArgumentsArray[1];
//   // TODO: FIX, this takes priority of UpdateSubCommands or the first listed option. There could be conflicting sub commands
//   const subCommand =
//     UpdateSubCommands[strSubCmd] ||
//     StatusSubCommands[strSubCmd] ||
//     HelpSubCommands[strSubCmd] ||
//     null;

//   if (!subCommand) {
//     throw new CliError({
//       errorType: 'NOT A VALID SUBCOMMAND',
//       message: `Cli Parsing Error: NOT A VALID SUBCOMMAND.
//       Type: "HELP"
//       or go to [help docs](${process.env.HELP_URL})
//       `,
//       senderEmail
//     });
//   }

//   return {
//     directive: directives[directive],
//     subCommand,
//     payload: cliArgumentsArray.slice(2),
//     senderEmail
//   };
// }

// export function dispatchActionFromZulipCli(cliDirective: ICliDirective) {
//   const { command, payload } = cliDirective;

//   switch (command) {
//     case cliCommands.UPDATE:
//       console.log('Updating', payload);
//       break;

//     case cliCommands.STATUS:
//       console.log('Status', payload);
//       break;
//   }
// }

// export function dispatchCliAction(cliAction: ICliAction) {}
