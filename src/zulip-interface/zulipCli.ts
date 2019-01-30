/**
 * This module is responsible for handling all commands
 * sent to the coffee chats bot
 */

interface IZulipRequest {
  // token: string,
  // data: string,
  // trigger: string, // 'private_message'
  // bot_email: string, // coffee-chat-bot-bot@recurse.zulipchat.com',
  message: {
    // recipient_id: number, //
    // sender_id: number, // can use this as our primary key?
    // type: string, // 'private'
    // sender_email: string, //
    sender_short_name: string; // 'alancodes'
    sender_full_name: string; // 'Alan Chu (W1\'18)',
    // rendered_content: string, // '<p>hi my name is alan</p>'
    content: string; // 'hi my name is alan' || 'hi it\'s I the code alan'
  };
}

interface ICliDirective {
  command: cliCommands;
  // payload: any[]; // should be an object with keys (--flag) & values (params)
  payload: string | Ipayload; // allow flexibility with payload if no flags passed?
}

// NOTE: string enums are not reverse mapped
export enum cliCommands {
  UPDATE = 'UPDATE', // updates your weekday
  STATUS = 'STATUS',
  HELP = 'HELP'
  // ADMIN = 'ADMIN', // for admin features
  // INFO = 'INFO',
  // PASS, // DO nothing, or default. Not necessary?
}

export enum payloadFlags {
  DATE_FLAG = '--DATE'
}
// NOTE: you can use enum values to define the keys of an interface
interface Ipayload {
  [payloadFlags.DATE_FLAG]?: string;
}

/**
 * ex.) update --date 12321 ==> command: UPDATE, payload: {DATE_FLAG: 12321}
 *
 * @param zulipRequest
 */
export function parseZulipServerRequest(
  zulipRequest: IZulipRequest
): ICliDirective {
  const {
    message: { content }
  } = zulipRequest;
  const cliArgumentsArray = content.split(' ');

  // Get first argument of requestbody, default to the help command if no arguments passed
  const strCommand =
    cliArgumentsArray.length > 0 ? cliArgumentsArray[0].toUpperCase() : '';

  const payload = {};

  for (let f = 1, d = 2; d < cliArgumentsArray.length; f += 2, d += 2) {
    const cliFlag = cliArgumentsArray[f].toUpperCase();
    const cliFlagData = cliArgumentsArray[d]; // does it make sense to make this caps too?

    // Check that odd indicies should be flags (must begin with --); 0 index is the CliCommand
    if (!cliFlag.startsWith('--')) {
      throw new Error(
        `Should have received a flag, but received "${cliFlag}" instead`
      );
    }

    if (cliFlagData.startsWith('--')) {
      throw new Error(
        `Non-flag arguments cannot begin with "--", received "${cliFlagData}"`
      );
    }

    payload[cliFlag] = cliFlagData;
  }

  // FEATURE:  fuzzy search feature, did you mean this COMMAND?
  const command = (Object as any).values(cliCommands).includes(strCommand)
    ? cliCommands[strCommand]
    : cliCommands.HELP;

  return {
    command,
    payload
  };
}

export function dispatchActionFromZulipCli(cliDirective: ICliDirective) {
  const { command, payload } = cliDirective;

  switch (command) {
    case cliCommands.UPDATE:
      console.log('Updating', payload);
      break;

    case cliCommands.STATUS:
      console.log('Status', payload);
      break;
  }
}
