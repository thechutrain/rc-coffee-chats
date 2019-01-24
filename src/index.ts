import logger from './logger';
// import { WEEKDAYS, EXCEPTION_DATES, oddNumberBackupEmails } from './constants';
import { isExceptionDay } from './utils';
import { initZulipAPI } from './zulipMessenger';

const _run = async () => {
  logger.info('-----------');
  const today = new Date();

  if (isExceptionDay(today)) {
    logger.info('Today is an exception day, no coffee chats T__T');
    return;
  }

  // 1) GEt all users from zulip
  // 2) Get activeEmails via: getSubscribedEmails({zulipAPI, users})
  // const activeEmails = await getSubscribedEmails({ zulipAPI, users });

  // 3) getUserConfigs
  // const userConfigs = await getUserConfigs({ emails: activeEmails });

  // 4) get Active EmailsForDay
  // const todaysActiveEmails = await getEmailsForDay({
  //   emails: activeEmails,
  //   userConfigs,
  //   day: today.getDay()
  // });

  // 5) Get emails that are an exception today;
  // const noEmailToday = await getEmailExceptions({ tableName: 'noNextMatch' });

  // 6) Get emails to match today, by filtering out cancel next email from active emails
  const emailsToMatch = todaysActiveEmails.filter(
    email => !noEmailToday.includes(email)
  );
  // logger.info('emailsToMatch', emailsToMatch);

  // IMPORTANT! Comment out this next line if you want to test something!!!
  // clearNoNextMatchTable();

  const matchedEmails = await matchEmails({ emails: emailsToMatch });
  logger.info('matchedEmails', matchedEmails);

  // IMPORTANT! Comment out this next line if you want to test something!!!
  sendAllMessages({ zulipAPI, matchedEmails, users, userConfigs });
};

// IMPORTANT! Do not comment out this next line UNLESS sendAllMessages is
// commented out in the run() function
// run();

const runWarningMessages = async () => {
  logger.info('-----------');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isExceptionDay(tomorrow)) {
    logger.info('Tomorrow is an exception day, no coffee chats, no warnings');
    return;
  }

  const zulipAPI = await zulip(zulipConfig);
  const users = (await zulipAPI.users.retrieve()).members;

  const subscribedEmails = await getSubscribedEmails({ zulipAPI, users });
  logger.info('subscribedEmails', subscribedEmails);

  const userConfigs = await getUserConfigs({ emails: subscribedEmails });
  logger.info('userConfigs', userConfigs);

  const emailsForTomorrow = await getEmailsForDay({
    emails: subscribedEmails,
    userConfigs,
    day: tomorrow.getDay()
  });
  logger.info('emailsForTomorrow', emailsForTomorrow);

  const warningsExceptions = await getEmailExceptions({
    tableName: 'warningsExceptions'
  });
  logger.info('warningsExceptions', warningsExceptions);

  const noEmailTomorrow = await getEmailExceptions({
    tableName: 'noNextMatch'
  });
  logger.info('noEmailTomorrow', noEmailTomorrow);

  const warningMessageEmails = emailsForTomorrow.filter(
    email =>
      !(warningsExceptions.includes(email) || noEmailTomorrow.includes(email))
  );
  logger.info('warningMessageEmails', warningMessageEmails);

  // Test:
  // const warningMessageEmails = [ 'nekanek@protonmail.com' ]
  // sendWarningMessages({ zulipAPI, warningMessageEmails });

  // IMPORTANT! Comment out this next line if you want to test something!!!
  sendWarningMessages({ zulipAPI, warningMessageEmails });
};
