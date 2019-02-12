/**
 * This module is responsible for handling all commands
 * sent from bot/zulip server --> our server
 */

import {
  IZulipRequest,
  ICliAction,
  directives,
  subCommands,
  CliError
} from './interface';
import { Util } from '../utils/index';

/**
 * try to parse the request, return a valid ICliAction or throw an error
 * @param zulipRequest
 */
// TODO: modularize / separate functionality here
// parsing vs. validating
export function parseZulipServerRequest(
  zulipRequest: IZulipRequest
): ICliAction {
  const {
    message: { content, sender_email: senderEmail }
  } = zulipRequest;
  const trimmedContent = content.replace(/^\s+|\s+$/g, '');

  const cliArgumentsArray = trimmedContent
    .split(/[\s]+/)
    .map(word => word.toUpperCase());

  // Case of no content: --> send the default help
  if (cliArgumentsArray[0] === '') {
    return {
      directive: directives.HELP,
      senderEmail
    };
  }

  ///////////////////////////
  // Validate Directive
  ///////////////////////////
  const directive = cliArgumentsArray[0];
  const validDirective = Util.valueExistsInEnum(directive, directives);
  if (!validDirective) {
    throw new CliError({
      errorType: 'NOT A VALID DIRECTIVE',
      message: `Cli parsing Error: first word must be a valid directive.
      Valid Directives include: UPDATE | STATUS | HELP
      `,
      senderEmail
    });
  } else if (directive === directives.HELP && cliArgumentsArray.length === 1) {
    // Generic Help case: args --> HELP
    return {
      directive: directives.HELP,
      senderEmail
    };
  } else if (cliArgumentsArray.length === 1) {
    return {
      directive: directives[directive],
      senderEmail
    };
  }

  ///////////////////////////
  // Validate Commands
  ///////////////////////////
  const subCommand = cliArgumentsArray[1];
  // TODO: case that they don't provide subcommand --> send help for that cmd!

  const validSubCmd = Util.valueExistsInEnum(subCommand, subCommands);
  if (!validSubCmd) {
    throw new CliError({
      errorType: 'NOT A VALID SUBCOMMAND',
      message: `Cli Parsing Error: NOT A VALID SUBCOMMAND.
      Type: "HELP ${directive}"
      or go to [help docs](${process.env.HELP_URL})
      `,
      senderEmail
    });
  }

  return {
    directive: directives[directive],
    subCommand: subCommands[subCommand],
    payload: cliArgumentsArray.slice(2),
    senderEmail
  };
}

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
