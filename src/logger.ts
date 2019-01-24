import * as winston from 'winston';

const timestamp = () => {
  new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
};

export const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp,
      level: 'info'
    }),
    new winston.transports.File({
      filename: 'winston.log',
      timestamp,
      level: 'info'
    })
  ]
});
