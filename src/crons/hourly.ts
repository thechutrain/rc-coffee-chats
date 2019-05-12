import moment from 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { matchify } from './matchify';
import { handlePossibleOffBoarding } from './off-board';
import { handlePossibleOnBoarding } from './on-board';
import { sendNextDayMatchWarning } from './match-warnings';
import { notifyAdmin } from '../zulip-messenger';

// NOTE: need to wrap hourly cron in try/catch since it won't log the error
// in logs if an exception is thrown.
try {
  hourly();
} catch (e) {
  console.warn(e);
  notifyAdmin(e, 'WARNING');
}

function hourly() {
  const now = moment().tz('America/New_York');
  const hour = now.hour();

  console.log('\n============== Cron hourly task ============');
  console.log(`>> Cron timecheck:`, now.toString(), { hour });
  console.log('>> Node env:', process.env.NODE_ENV);

  // Run at 8pm EST
  if (hour === 8) {
    // makes matches and notifies users
    matchify();
  } else if (hour === 15) {
    handlePossibleOffBoarding();
    handlePossibleOnBoarding();
  } else if (hour === 19) {
    // send warning notifications
    sendNextDayMatchWarning();
  }
}
