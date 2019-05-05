/** Note: no tests are written for this file since it would
 * basically be testing the recurse API. Could be useful if
 * the api does change!
 *
 */
import * as dotenv from 'dotenv-safe';
dotenv.config();
import axios from 'axios';
import * as types from './rctypes';

// Gets all the users coming to Ngw
export function getUsersAtNgw(): Promise<types.rc_profile[]> {
  return getUsers({ scope: 'ngw' });
}

// Gets all the users currently at RC
export function getUsersAtRc(): Promise<types.rc_profile[]> {
  return getUsers({ scope: 'current' });
}

/**
 * See more @ https://github.com/recursecenter/wiki/wiki/Recurse-Center-API#profiles
 * @param params
 */
export function getUsers(params): Promise<types.rc_profile[]> {
  return new Promise(async resolve => {
    let allUsers: any = [];
    let hasMore = true;
    const limit = params.limit || 50;

    for (let i = 0; hasMore; i++) {
      const users = await getPaginatedUsers({
        ...params,
        offset: i * limit,
        limit
      });
      allUsers = [...allUsers, ...users];
      hasMore = users.length === limit;
    }

    resolve(allUsers);
  });
}

export function getPaginatedUsers(params): Promise<types.rc_profile[]> {
  const apiEndpoint = 'https://www.recurse.com/api/v1/profiles';
  return axios
    .get(`${apiEndpoint}`, {
      params,
      headers: {
        Authorization: `Bearer ${process.env.RC_TOKEN}`
      }
    })
    .then(resp => resp.data);
}

/**
 *  No longer necesssary!
 *  - previously we were getting batch info --> users
 *  - now we can go from user --> batch (stints)
 */
export function getUsersFromBatch(batchId): Promise<types.rc_profile[]> {
  return getUsers({ batch_id: batchId });
}

// No longer necessary
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
