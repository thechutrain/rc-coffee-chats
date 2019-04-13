// TODO: Validate that for each msgType, required parameters are there

// switch (messageType) {
//   case types.msgTemplate.PROMPT_SIGNUP:
//     content = `Hello there! I'm :coffee: bot!
//     You are not currently registered as a user of coffee chats
//     Type SIGNUP to join`;
//     break;

//   case types.msgTemplate.SIGNED_UP:
//     content = `You've successfully been added to coffee chat!
//     Type HELP or learn more at [github.com/thechutrain/rc-coffee-chats](https://github.com/thechutrain/rc-coffee-chats)`;
//     break;
//   ////////////////////////
//   // UPDATE messages
//   ////////////////////////
//   // case types.msgTemplate.UPDATED_DAYS:
//   //   content = `You have successfully updated your coffee chat days to: ${strVars.days.join(
//   //     ' '
//   //   )}`;
//   //   break;

//   // case types.msgTemplate.UPDATED_WARNINGS:
//   //   content = `You have successfully updated your warning settings to be: ${
//   //     strVars.warnings ? 'ON' : 'OFF'
//   //   }`;
//   //   break;

//   ////////////////////////
//   // STATUS messages
//   ////////////////////////
//   // case types.msgTemplate.STATUS:
//   //   content = `You have had ${strVars.num_of_chats} number of chats so far`;
//   //   break;

//   // case types.msgTemplate.STATUS_DAYS:
//   //   content = `You are currently set to have coffee chats on the following days: ${
//   //     strVars.days
//   //   }`;
//   //   break;

//   // case types.msgTemplate.STATUS_WARNINGS:
//   //   content = `Your reminder warnings are currently set to be: ${
//   //     strVars.warnings
//   //   }`;
//   //   break;

//   // case types.msgTemplate.STATUS_SKIP:
//   //   content = `You will ${
//   //     strVars.skipNext ? '' : 'NOT'
//   //   } be skipping your next match. `;
//   //   break;

//   ////////////////////////
//   // HELP messages
//   ////////////////////////
//   case types.msgTemplate.HELP:
//     content = `Hi! I'm :coffee: bot and I'm here to help!
//     To talk to me, enter a valid command that begins with the following:
//     \`\`\`UPDATE | STATUS | HELP\`\`\`
//     I'm also open-sourced, so you can help contribute and make me better :smile:
//     You can see find my inner workings @ [github](${
//       process.env.HELP_URL
//     }) or post an issue @ [issues](${process.env.GITHUB_URL}/issues)
//     `;
//     break;

//   default:
//     content = `${
//       types.msgTemplate[messageType]
//     } custom message not yet defined`;
//     break;
// }

// return content;
// }

// TODO:
// Ensures each message type with required vars have been provided
// export function validateRequiredVars(
//   messageType: msgType,
//   overloadArgs
// ): boolean {
//   return true;
// }
// ================= OLD VERSION =================
// if (msgOpt.status === MsgStatus.ERROR) {
//   messageContent = `Sorry there was an error handling your request. If this is a bug, please submit an issue @  [${
//     process.env.GITHUB_URL
//   }](${process.env.GITHUB_URL})
//   ------ given request --------
//   payload: ${msgOpt.payload}
//   message: ${msgOpt.message}
//   cli: ${JSON.stringify(msgOpt.cliAction)}
//   `;
// } else {
//   switch (msgOpt.messageType) {
//     ////////////////////////
//     // Messages related to non-signed up users
//     ////////////////////////
//     case msgType.PROMPT_SIGNUP:
//       messageContent = `Hello there! I'm :coffee: bot!
//       You are not currently registered as a user of coffee chats
//       Type SIGNUP to join`;
//       break;

//     case msgType.SIGNUP:
//       messageContent = `You've successfully been added to coffee chat!
//         Type HELP or learn more at [github.com/thechutrain/rc-coffee-chats](https://github.com/thechutrain/rc-coffee-chats)`;

//       break;

//     ////////////////////////
//     // CHANGE messages
//     ////////////////////////
//     case msgType.UPDATE_DAYS:
//       messageContent = `You have successfully updated your coffee chat days.`;
//       break;

//     case msgType.UPDATE_WARNINGS:
//       const warningsOnOff = msgOpt.payload.warning_exception ? 'ON' : 'OFF';
//       messageContent = `You've successfully updated your warning settings.
//         warnings exceptions are set to be ${warningsOnOff}`;

//       break;

//     case msgType.UPDATE_SKIP:
//       const skipping = msgOpt.payload.skip_next_match ? ' NOT' : '';
//       messageContent = `You've successfully updated your "skip_next_match" settings.

//         You will${skipping} be skipping your next match.`;
//       break;

//     ////////////////////////
//     // STATUS messages
//     ////////////////////////
//     case msgType.STATUS_DAYS:
//       const daysAsString = msgOpt.payload.coffeeDays.join(' ');
//       messageContent = `You are currently set to have coffee chats on the following days: ${daysAsString}`;
//       break;

//     case msgType.STATUS_WARNINGS:
//       // TODO: handle errors?
//       const warningsText = msgOpt.payload.warningException ? 'ON' : 'OFF';
//       // const willOrWillNot = msgOpt.payload.warningException ? 'WILL' : 'WILL NOT'
//       messageContent = `Your reminder warnings are currently set to be: ${warningsText}`;
//       break;

//     case msgType.STATUS_SKIP:
//       const { skipNext } = msgOpt.payload;
//       messageContent = `You will ${
//         skipNext ? '' : 'NOT'
//       } be skipping your next match. `;
//       break;

//     ////////////////////////
//     // HELP messages
//     ////////////////////////
//     case msgType.HELP_UPDATE:
//       messageContent = `Valid **update** commands:
//       UPDATE <DAYS | SKIP | WARNINGS> [... list of args]
//       * <DAYS> - [MON, TUE, WED, THU, FRI, SAT, SUN]
//         --> update the days that you plan on having coffee chats
//       * <SKIP> - TRUE | FALSE
//         --> skip your next match
//       * <WARNINGS> - TRUE | FALSE
//         --> updates whether you will receive warnings the night before about skipping your match or not
//       * <ACTIVE> - TRUE | FALSE
//         --> updates whether you are active on coffee chats or not
//       See more @ [docs](${process.env.HELP_URL})
//       `;
//       break;

//     case msgType.HELP_STATUS:
//       messageContent = `Valid **status** commands:
//       STATUS <DAYS | SKIP | WARNINGS> [... list of optional args]
//       * <DAYS>
//         --> returns the days that you are signed up for
//       * <SKIP>
//         --> returns boolean of whether you will skip your next match or not
//       * <WARNINGS>
//         --> returns boolean of whether you will get warnings or not
//       See more @ [docs](${process.env.HELP_URL})`;
//       break;

//     case msgType.HELP:
//       messageContent = `Hi! I'm :coffee: bot and I'm here to help!
//       To talk to me, enter a valid command that begins with the following:
//       \`\`\`UPDATE | STATUS | HELP\`\`\`
//       I'm also open-sourced, so you can help contribute and make me better :smile:
//       You can see find my inner workings @ [github](${
//         process.env.HELP_URL
//       }) or post an issue @ [issues](${process.env.GITHUB_URL}/issues)
//       `;
//       break;

//     default:
//       messageContent = `DEFAULT OK MSG:
//         payload: ${msgOpt.payload}
//         message: ${msgOpt.message}
//         cli: ${JSON.stringify(msgOpt.cliAction)}
//         `;
//       break;
//   }
// }

// sendGenericMessage(toEmail, messageContent);
// }

// function createMsgContent(msgType) {
//   const strVars = {
//     foo: 'bar'
//   };
//   const MESSAGE_TEMPLATES = {
//     [msgType.PROMPT_SIGNUP]: `I am a variable ${
//       strVars.foo
//     } You are not currently signed up as a user of coffee chats Type SIGNUP to join`
//   };
//   return MESSAGE_TEMPLATES[msgType];
// }
