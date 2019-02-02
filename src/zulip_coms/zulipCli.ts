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

  // NOTE: do I need to trim the white space??
  const cliArgumentsArray = content.split(' ').map(word => word.toUpperCase());

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
  }

  ///////////////////////////
  // Validate Commands
  ///////////////////////////
  const subCommand = cliArgumentsArray[1];
  const validSubCmd = Util.valueExistsInEnum(subCommand, subCommands);
  if (!validDirective) {
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

// export function parseZulipServerRequest(
//   zulipRequest: IZulipRequest
// ): ICliAction | ICliError {
//   const {
//     message: { content }
//   } = zulipRequest;
//   const cliArgumentsArray = content.split(' ');

//   // Get first argument of requestbody, default to the help command if no arguments passed
//   const strCommand =
//     cliArgumentsArray.length > 0 ? cliArgumentsArray[0].toUpperCase() : '';

//   const payload = {};

//   for (let f = 1, d = 2; d < cliArgumentsArray.length; f += 2, d += 2) {
//     const cliFlag = cliArgumentsArray[f].toUpperCase();
//     const cliFlagData = cliArgumentsArray[d]; // does it make sense to make this caps too?

//     // Check that odd indicies should be flags (must begin with --); 0 index is the CliCommand
//     if (!cliFlag.startsWith('--')) {
//       throw new Error(
//         `Should have received a flag, but received "${cliFlag}" instead`
//       );
//     }

//     if (cliFlagData.startsWith('--')) {
//       throw new Error(
//         `Non-flag arguments cannot begin with "--", received "${cliFlagData}"`
//       );
//     }

//     payload[cliFlag] = cliFlagData;
//   }

//   // FEATURE:  fuzzy search feature, did you mean this COMMAND?
//   const command = (Object as any).values(cliCommands).includes(strCommand)
//     ? cliCommands[strCommand]
//     : cliCommands.HELP;

//   return {
//     command,
//     payload
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
