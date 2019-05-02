import { initDB } from '../db';
import * as types from '../types';
import { sendGenericMessage } from './msg-sender';

type adminMsgPrefex = 'LOG' | 'WARNING' | 'OK';

export function notifyAdmin(
  message: string,
  msgPrefixType: adminMsgPrefex = 'LOG'
) {
  const db = initDB();
  const adminEmailList = db.User.findAdmins().map(adminUser => adminUser.email);
  let msgPrefix = '';
  switch (msgPrefixType) {
    case 'LOG':
      msgPrefix = '🌲 LOG MESSAGE 🌲\n';
      break;
    case 'WARNING':
      msgPrefix = '⚠ ALERT ⚠\n';
      break;
    case 'OK':
      msgPrefix = `✅ Status OKAY\n`;
      break;
  }
  sendGenericMessage(adminEmailList, msgPrefix + message);
}
