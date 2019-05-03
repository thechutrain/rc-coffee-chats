import { handlePossibleOffboarding } from '../one-off-services/offboarding';
import moment from 'moment-timezone';

// This file should be called from cron every hour :)
function hourly() {
  const now = moment().tz('America/New_York');
  const hour = now.hour();

  console.log('Cron hourly task:', now.toString(), { hour });

  // Run at 5pm EST
  if (hour === 17) {
    handlePossibleOffboarding();
  }
}

// run main
hourly();
