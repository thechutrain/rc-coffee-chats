/** This is no longer being used. Since we get a user's end date
 *
 */

// import moment from 'moment';
// import 'moment-timezone';
// import * as dotenv from 'dotenv-safe';
// dotenv.config();

// import * as types from './rctypes';
// import { getUsersFromBatch, getBatches } from './api-calls';

// /** Gets the batches that are starting and ending today
//  *
//  * @param day {opt}
//  */
// export async function getCurrentBatches(
//   day?: string
// ): Promise<types.rc_batch[]> {
//   const currentBatches: types.rc_batch[] = [];
//   const today =
//     day ||
//     moment()
//       .tz('America/New_York')
//       .format('YYYY-MM-DD');

//   const allBatches = await getBatches();

//   allBatches.forEach(batch => {
//     if (batch.end_date >= today && batch.start_date <= today) {
//       currentBatches.push(batch);
//     }
//   });

//   return currentBatches;
// }

// export function isMiniBatch(batch: types.rc_batch): boolean {
//   const regex = /^Mini/gi;

//   return regex.test(batch.name);
// }

// export function getSixWeekEndDate(batch: types.rc_batch): string {
//   if (isMiniBatch(batch)) {
//     throw new Error(
//       'You should not be getting the 6wk endpoint of a mini batch'
//     );
//   }

//   return moment(batch.start_date)
//     .add(5, 'weeks')
//     .startOf('week')
//     .add(4, 'days')
//     .format('YYYY-MM-DD');
// }
