import moment from 'moment';

export const isToday = (date: string): boolean =>
  moment().diff(moment(date), 'days') === 0;
