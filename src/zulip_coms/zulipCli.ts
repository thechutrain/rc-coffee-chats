/**
 * This module is responsible for handling all commands
 * sent from bot/zulip server --> our server
 */

import {
  IZulipRequest,
  ICliAction,
  ICliError,
  directives,
  subCommands
} from './interface';
import { Util } from '../utils/index';

export function parseZulipServerRequest(
  zulipRequest: IZulipRequest
): ICliAction | ICliError {
  const {
    message: { content }
  } = zulipRequest;
  const trimmedContent = content.replace(/^\s+|\s+$/g, '');

  const cliArgumentsArray = trimmedContent
    .split(/[\s]+/)
    .map(word => word.toUpperCase());

  // Case of no content: --> send the default help
  if (!cliArgumentsArray.length) {
    return {
      directive: directives.HELP
    };
  }

  ///////////////////////////
  // Validate Directive
  ///////////////////////////
  const directive = cliArgumentsArray[0];
  const validDirective = Util.valueExistsInEnum(directive, directives);
  if (!validDirective) {
    return {
      status: 'ERROR',
      errorType: 'NO VALID DIRECTIVE',
      message: `Cli parsing Error: first word must be a valid directive.
      Directive Received: ${directive}`
    };
  } else if (directive === directives.HELP && cliArgumentsArray.length === 1) {
    // Generic Help case: args --> HELP
    return {
      directive: directives.HELP
    };
  }

  ///////////////////////////
  // Validate Commands
  ///////////////////////////
  const subCommand = cliArgumentsArray[1];
  const validSubCmd = Util.valueExistsInEnum(subCommand, subCommands);
  if (!validSubCmd) {
    return {
      status: 'ERROR',
      errorType: 'NO VALID SUBCOMMAND',
      message: `Cli Parsing Error: second word must be a valid subcommand.
      Received subCommand: ${subCommand}`
    };
  }

  return {
    directive: directives[directive],
    subCommand: subCommands[subCommand],
    payload: cliArgumentsArray.slice(2)
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
