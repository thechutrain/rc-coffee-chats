export enum WEEKDAYS {
  SUN,
  MON,
  TUE,
  WED,
  THU,
  FRI,
  SAT
}

// export const DEFAULT_COFFEE_DAYS = [
//   WEEKDAYS.MON,
//   WEEKDAYS.TUE,
//   WEEKDAYS.WED,
//   WEEKDAYS.THU
// ];

// Exception dates can be added in this array,
//     - the coffee chat bot won't run on these dates
//     - the warning won't be sent on the day prior to these dates
// BUT REMEMBER: js is very old school, so it counts months from 0,
// that's why we create exception dates with month values being 1 less than the real world month value
// ¯\_(ツ)_/¯

// TODO: exception dates && oddNumberBacksup should eventually be put in a separate table
export const EXCEPTION_DATES = [Date.UTC(2018, 12 - 1, 31)];
export const oddNumberBackupUsers = [
  {
    is_active: true,
    full_name: 'Alicia',
    is_bot: false,
    email: 'alicia@recurse.com'
  }
];

export const BOT_COMMANDS = {
  WARNINGS_OFF: 'warnings off',
  WARNINGS_ON: 'warnings on',
  CANCEL_NEXT: 'cancel next match'
};

export const MESSAGES = {
  WARNING: `Hi there, You will be matched tomorrow for a coffee chat. 
              If you don't want to be matched tomorrow reply to me with "cancel next match". 
              If you no longer want to receive these warning messages, reply to me with a message "warnings off".
              If you don't want to participate in the coffee chats anymore, unsubscribe from "coffee chats" channel.`,

  WARNINGS_OFF: `Hi! You've successfully unsubscribed from warning messages! (You are still going to be matched while subscribed to the channel).`,

  WARNINGS_ON: `Hi! You've successfully subscribed to the warning messages!`,

  INFO: `Hi! To change the days you get matched send me a message with any subset of the numbers 0123456.
0 = Sunday
1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday
E.g. Send "135" for matches on Monday, Wednesday, and Friday.

To unsubscribe from warning messages send me a message "warnings off".
To subscribe to the warning messages send me a message "warnings on".`,

  CANCEL_NEXT: `Hi! You've successfully cancelled your match for coffee tomorrow! Have a nice day!`
};
