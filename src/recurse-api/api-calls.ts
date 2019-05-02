import * as dotenv from 'dotenv-safe';
dotenv.config();
import axios from 'axios';

import * as types from './rctypes';

export function getUsersFromBatch(batch_id): Promise<types.rc_profile[]> {
  const apiEndpoint = 'https://www.recurse.com/api/v1/profiles';
  return axios
    .get(`${apiEndpoint}`, {
      params: {
        batch_id
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
      // console.log(response.data[0]);
      // console.log(response.data[1]);
      return response.data;
    });
}

// TESTING:
// getBatches(); // 63 --> mini batch, 60 --> spring 2
// getUsersFromBatch(63);
