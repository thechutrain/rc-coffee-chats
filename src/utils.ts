import { WEEKDAYS, EXCEPTION_DATES } from './constants';

export const isExceptionDay = day => {
  const inUTC = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
  for (const i in EXCEPTION_DATES) {
    if (EXCEPTION_DATES[i] === inUTC) {
      return true;
    }
  }
  return false;
};

export const getUserWithEmail = ({ users, email }) => {
  return users.find(user => user.email === email);
};

export const tryToGetUsernameWithEmail = ({ users, email }) => {
  try {
    return getUserWithEmail({ users, email }).full_name;
  } catch (e) {
    return email;
  }
};
