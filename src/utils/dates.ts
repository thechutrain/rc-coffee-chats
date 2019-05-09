import moment from 'moment-timezone';

export const isToday = (date: string): boolean =>
  moment().diff(moment(date), 'days') === 0;

// TESTING
// console.log(isToday('2019-05-04'));
