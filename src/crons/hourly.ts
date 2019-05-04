import { handlePossibleOffboarding } from '../one-off-services/offboarding';
import moment from 'moment-timezone';

// This file should be called from cron every hour :)
function hourly() {
  const now = moment().tz('America/New_York');
  const hour = now.hour();

  console.log('\n==============\nCron hourly task:', now.toString(), { hour });

  // Run at 8pm EST
  if (hour === 8) {
    // run matching
  } else if (hour === 16) {
    console.log('testing ... the hour of 4pm');
  } else if (hour === 17) {
    console.log('running at 5pm yooo');
    handlePossibleOffboarding();
  } else if (hour === 19) {
    // send warning notifications
  }
}

// run main
hourly();
