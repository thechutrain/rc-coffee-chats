import { initDB } from '../db';
import * as types from '../types';
import { sendGenericMessage } from './msg-sender';

export function notifyAdmin(message: string) {
  const db = initDB();
  // PREVIOUS
  // const adminEmailList = db.User.findAdmins().map(adminUser => {
  //   sendGenericMessage(adminUser.email, '🌲 LOG MESSAGE 🌲\n' + message);
  // });

  const adminEmailList = db.User.findAdmins().map(adminUser => adminUser.email);
  sendGenericMessage(adminEmailList, '🌲 LOG MESSAGE 🌲\n' + message);
}
