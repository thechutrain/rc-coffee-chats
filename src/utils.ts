import { EXCEPTION_DATES } from './constants';

export const getUserWithEmail = ({ users, email }) => {
  return users.find(user => user.email === email);
};

// Wat? - used in sendAllMessages? may not need ...
export const tryToGetUsernameWithEmail = ({ users, email }) => {
  try {
    return getUserWithEmail({ users, email }).full_name;
  } catch (e) {
    return email;
  }
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
