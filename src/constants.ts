export enum WEEKDAYS {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY
}

export const DEFAULT_COFFEE_DAYS = [
  WEEKDAYS.MONDAY,
  WEEKDAYS.TUESDAY,
  WEEKDAYS.WEDNESDAY,
  WEEKDAYS.THURSDAY
];

// Exception dates can be added in this array,
//     - the coffee chat bot won't run on these dates
//     - the warning won't be sent on the day prior to these dates
// BUT REMEMBER: js is very old school, so it counts months from 0,
// that's why we create exception dates with month values being 1 less than the real world month value
// ¯\_(ツ)_/¯

// TODO: exception dates && oddNumberBacksup should eventually be put in a separate table
export const EXCEPTION_DATES = [Date.UTC(2018, 12 - 1, 31)];
export const oddNumberBackupEmails = ['alicia@recurse.com'];
