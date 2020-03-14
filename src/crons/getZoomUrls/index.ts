import { getUsersAtRc } from '../../recurse-api';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from '../../db';
// get all current rc-ers

// check to see if they are in our coffee chat db

// if they have a zoom url, save that in the user record
export async function UpdateZoomUrlForUsers() {
  const db = initDB();
  const allRCUsers = await getUsersAtRc();
  console.log(allRCUsers);
  allRCUsers.forEach(({ email, zoom_url }) => {
    const dbUser = db.User.findByEmailOrNull(email);
    if (dbUser !== null) {
      console.log(`Updating zoom url to: ${zoom_url}`);
      db.User.updateZoomUrl(zoom_url, email);
    }
  });
}

UpdateZoomUrlForUsers();
