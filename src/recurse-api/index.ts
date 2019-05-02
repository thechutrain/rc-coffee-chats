import moment from 'moment';
import 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import * as types from './rctypes';
import { getUsersFromBatch, getBatches } from './api-calls';

export async function getStartingEndingBatches(
  day?: string
): Promise<{
  starting_batches: types.rc_batch[];
  ending_batches: types.rc_batch[];
}> {
  const starting_batches: types.rc_batch[] = [];
  const ending_batches: types.rc_batch[] = [];
  const today =
    day ||
    moment()
      .tz('America/New_York')
      .format('YYYY-MM-DD');

  const allBatches = await getBatches();
  allBatches.forEach(batch => {
    if (batch.start_date === today) {
      starting_batches.push(batch);
    } else if (batch.end_date === today) {
      ending_batches.push(batch);
    }
  });

  return {
    starting_batches,
    ending_batches
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
