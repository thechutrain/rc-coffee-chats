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
export async function getCurrentBatches(
  day?: string
): Promise<types.rc_batch[]> {
  const currentBatches: types.rc_batch[] = [];
  const today =
    day ||
    moment()
      .tz('America/New_York')
      .format('YYYY-MM-DD');

  const allBatches = await getBatches();
  // console.log(allBatches);

  allBatches.forEach(batch => {
    if (batch.end_date >= today && batch.start_date <= today) {
      currentBatches.push(batch);
    }
  });

  return currentBatches;
}

// export async function getNewCurrentBatches(
//   day?: string
// ): Promise<{
//   newBatches: types.rc_batch[];
//   currentBatches: types.rc_batch[];
// }> {
//   const newBatches: types.rc_batch[] = [];
//   const currentBatches: types.rc_batch[] = [];
//   const today =
//     day ||
//     moment()
//       .tz('America/New_York')
//       .format('YYYY-MM-DD');

//   const allBatches = await getBatches();
//   // console.log(allBatches);

//   allBatches.forEach(batch => {
//     if (batch.start_date === today) {
//       newBatches.push(batch);
//     } else if (batch.end_date >= today && batch.start_date < today) {
//       currentBatches.push(batch);
//     }
//   });

//   return {
//     newBatches,
//     currentBatches
//   };
// }
