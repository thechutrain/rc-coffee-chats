export const coffeeDaysMap = {
  '0': 'Sunday',
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday'
};

// Exception dates can be added in this array,
//     - the coffee chat bot won't run on these dates
//     - the warning won't be sent on the day prior to these dates
// BUT REMEMBER: js is very old school, so it counts months from 0,
// that's why we create exception dates with month values being 1 less than the real world month value
// ¯\_(ツ)_/¯

export const EXCEPTION_DATES = [Date.UTC(2018, 12 - 1, 31)];

export const oddNumberBackupEmails = ['alicia@recurse.com'];
