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
  payload: string | I;
}

// NOTE: string enums are not reverse mapped
export enum cliCommands {
  UPDATE = 'UPDATE', // updates your weekday
  STATUS = 'STATUS',
  HELP = 'HELP'
  // PASS, // DO nothing, or default. Not necessary?
}

export function parseZulipServerRequest(
  zulipRequest: IZulipRequest
): ICliDirective {
  const {
    message: { content }
  } = zulipRequest;
  const cliArgumentsArray = content.split(' ');

  // Get first argument of requestbody, default to the help command if no arguments passed
  let command;
  let payload;
  const strCommand =
    cliArgumentsArray.length > 0 ? cliArgumentsArray[0].toUpperCase() : '';
  payload = cliArgumentsArray.length > 0 ? cliArgumentsArray.slice(1) : [];

  // FEATURE:  fuzzy search feature, did you mean this COMMAND?
  if (isNaN(parseInt(strCommand, 10))) {
    // Assume first argument is a string
    command = (Object as any).values(cliCommands).includes(strCommand)
      ? cliCommands[strCommand]
      : cliCommands.HELP;
  } else {
    /**
     * Liz's design suggestion: if no command default to changing of the dates
     * ex.) input of: 12345
     *     output = UPDATE_WEEKDAYS, 12345
     */
    command = cliCommands.UPDATE;
    payload = cliArgumentsArray.slice(0); // since first argument isnt a command, but payload
  }

  return {
    command,
    payload
  };
}
