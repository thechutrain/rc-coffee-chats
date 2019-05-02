import * as dotenv from 'dotenv-safe';
dotenv.config();
import axios from 'axios';

function getUsersFromBatch(batch_id) {
  const apiEndpoint = 'https://www.recurse.com/api/v1/profiles';
  axios
    .get(`${apiEndpoint}`, {
      params: {
        batch_id
      },
      headers: {
        Authorization: `Bearer ${process.env.RC_TOKEN}`
      }
    })
    .then(response => {
      console.log(response.data);
    });
}

function getMostRecentBatch() {
  const apiEndpoint = 'https://www.recurse.com/api/v1';
  axios
    .get(`${apiEndpoint}/batches`, {
      headers: {
        Authorization: `Bearer ${process.env.RC_TOKEN}`
      }
    })
    .then(response => {
      console.log(response.data);
      /**
       * 
  [ { id: 63,
    name: 'Mini 3, 2019',
    start_date: '2019-04-01',
    end_date: '2019-04-05' },
  { id: 60,
    name: 'Spring 2, 2019',
    start_date: '2019-04-01',
    end_date: '2019-06-27' },
  { id: 58,
    name: 'Spring 1, 2019',
    start_date: '2019-02-18',
    end_date: '2019-05-09' },
       * 
       * 
       * 
       */
    });
}

// getMostRecentBatch();
getUsersFromBatch(63);
