import moment from 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { matchify } from './matchify';
import { handlePossibleOffboarding } from './off-boarding';
import { sendNextDayMatchWarning } from './match-warnings';

// This file should be called from cron every hour :)
function hourly() {
  const now = moment().tz('America/New_York');
  const hour = now.hour();

  console.log('\n==============\nCron hourly task:', now.toString(), { hour });

  // Run at 8pm EST
  if (hour === 8) {
    // makes matches and notifies users
    matchify();
  } else if (hour === 14) {
    // handle possible Onboarding
  } else if (hour === 17) {
    handlePossibleOffboarding();
  } else if (hour === 19) {
    // send warning notifications
    sendNextDayMatchWarning();
  }
}

// run main
hourly();
