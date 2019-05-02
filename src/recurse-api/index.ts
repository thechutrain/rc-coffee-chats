import moment from 'moment';
import 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import * as types from './rctypes';
import { getUsersFromBatch, getBatches } from './api-calls';

/** Gets the batches that are starting and ending today
 *
 * @param day {opt}
 */
export async function getNewCurrentBatches(
  day?: string
): Promise<{
  newBatches: types.rc_batch[];
  currentBatches: types.rc_batch[];
}> {
  const newBatches: types.rc_batch[] = [];
  const currentBatches: types.rc_batch[] = [];
  const today =
    day ||
    moment()
      .tz('America/New_York')
      .format('YYYY-MM-DD');

  const allBatches = await getBatches();
  allBatches.forEach(batch => {
    if (batch.start_date === today) {
      newBatches.push(batch);
    } else if (batch.end_date === today) {
      currentBatches.push(batch);
    }
  });

  return {
    newBatches,
    currentBatches
  };
}

// '2019-06-27'
// getStartingEndingBatches('2019-04-01');
// export async function isFirstDayOfBatch() {
//   const allBatches = await getBatches();
//   // console.log(allBatches);
//   console.log(allBatches[0]);
//   return false;
// }

// isFirstDayOfBatch();
