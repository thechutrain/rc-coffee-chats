export enum WEEKDAYS {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY
}

// Exception dates can be added in this array,
//     - the coffee chat bot won't run on these dates
//     - the warning won't be sent on the day prior to these dates
// BUT REMEMBER: js is very old school, so it counts months from 0,
// that's why we create exception dates with month values being 1 less than the real world month value
// ¯\_(ツ)_/¯

export const EXCEPTION_DATES = [Date.UTC(2018, 12 - 1, 31)];
export const oddNumberBackupEmails = ['alicia@recurse.com'];

export const WARNING_MSG = `Hi there, You will be matched tomorrow for a coffee chat. 
              If you don't want to be matched tomorrow reply to me with "cancel next match". 
              If you no longer want to receive these warning messages, reply to me with a message "warnings off".
              If you don't want to participate in the coffee chats anymore, unsubscribe from "coffee chats" channel.`;
