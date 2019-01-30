import { EXCEPTION_DATES, WEEKDAYS } from '../constants';

export function castBoolInt(boolVal): 0 | 1 {
  return boolVal ? 1 : 0;
}

/// ======= previous stuff ==========

export const stringifyWeekDays = dayNumbersArray => {
  if (typeof dayNumbersArray === 'string') {
    dayNumbersArray = dayNumbersArray.split('');
  }
  return dayNumbersArray.map(dayNum => WEEKDAYS[dayNum]).join();
};
// export const isExceptionDay = day => {
//   const inUTC = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
//   for (const i in EXCEPTION_DATES) {
//     if (EXCEPTION_DATES[i] === inUTC) {
//       return true;
//     }
//   }
//   return false;
// };

// PREVIOUS JS VERSION
// TODO: better to separate out contasts of exception dates from isExceptionDay function
// decoupling will make it easier to test!
export function isExceptionDay(day: Date): boolean {
  const inUTC = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
  for (const i in EXCEPTION_DATES) {
    if (EXCEPTION_DATES[i] === inUTC) {
      return true;
    }
  }
  return false;
}

// coffee_days is formatted as a string of ints mapped to days 0123456 (Sunday = 0)
const getEmailsForDay = ({ emails, userConfigs, day }) => {
  const userConfigMap = userConfigs.reduce((acc, v) => {
    // acc[v['email']] = String(v['coffee_days']);
    acc[v.email] = String(v.coffee_days);
    return acc;
  }, {});

  const isDefaultDay = process.env.DEFAULT_COFFEE_DAYS.includes(day);
  return emails.filter(email => {
    const config = userConfigMap[email];
    if (!config && isDefaultDay) return true;
    if (config && config.includes(day)) return true;
    return false;
  });
};
