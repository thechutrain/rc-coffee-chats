/** Note: no tests are written for this file since it would
 * basically be testing the recurse API. Could be useful if
 * the api does change!
 *
 */
import * as dotenv from 'dotenv-safe';
dotenv.config();
import axios from 'axios';

import * as types from './rctypes';

export function getUsersFromBatch(batchId): Promise<types.rc_profile[]> {
  const apiEndpoint = 'https://www.recurse.com/api/v1/profiles';
  return axios
    .get(`${apiEndpoint}`, {
      params: {
        batch_id: batchId
      },
      headers: {
        Authorization: `Bearer ${process.env.RC_TOKEN}`
      }
    })
    .then(response => {
      // console.log(response.data);
      return response.data;
    });
}

export function getBatches(): Promise<types.rc_batch[]> {
  const apiEndpoint = 'https://www.recurse.com/api/v1';
  return axios
    .get(`${apiEndpoint}/batches`, {
      headers: {
        Authorization: `Bearer ${process.env.RC_TOKEN}`
      }
    })
    .then(response => {
      // console.log(response.data);
      return response.data;
    });
}

// export function getFutureBatch(batch_id: number): Promise<types.rc_batch[]> {
//   const apiEndpoint = 'https://www.recurse.com/api/v1';
//   return axios
//     .get(`${apiEndpoint}/batches/${batch_id}`, {
//       headers: {
//         Authorization: `Bearer ${process.env.RC_TOKEN}`
//       }
//     })
//     .then(response => {
//       console.log(response);
//       return response.data;
//     })
//     .catch(err => {
//       console.log(err);
//     });
// }
