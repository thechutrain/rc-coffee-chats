import { initDB } from '../db';
import * as types from '../types';
import { sendGenericMessage } from './msg-sender';

export function notifyAdmin(message: string) {
  const db = initDB();
  const adminEmailList = db.User.findAdmins().map(adminUser => {
    sendGenericMessage(adminUser.email, '🌲 LOG MESSAGE 🌲\n' + message);
  });
}
