import {getUsersAtNgw, getUsersAtRc} from '../../recurse-api';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from '../../db';

export async function UpdateZoomUrlForUsers() {
  const db = initDB();

  const allNGWUsers = await getUsersAtNgw();
  allNGWUsers.forEach(({ email, zoom_url }) => {
    const dbUser = db.User.findByEmailOrNull(email);
    if (dbUser !== null) {
      db.User.updateZoomUrl(zoom_url, email);
    }
  });

  const allRCUsers = await getUsersAtRc();
  allRCUsers.forEach(({ email, zoom_url }) => {
    const dbUser = db.User.findByEmailOrNull(email);
    if (dbUser !== null) {
      console.log(`Updating zoom url to: ${zoom_url}`);
      db.User.updateZoomUrl(zoom_url, email);
    }
  });
}

UpdateZoomUrlForUsers();
