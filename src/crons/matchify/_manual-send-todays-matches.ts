import { cloneDeep } from 'lodash';
import moment from 'moment';
import 'moment-timezone';
import * as dotenv from 'dotenv-safe';
dotenv.config();

import { initDB } from '../../db';
import * as types from '../../types';
import { createSuitorAcceptorPool } from './create-suitor-acceptor-pool';
import { makeStableMarriageMatches } from '../../matching-algo/stable-marriage-matching/stable-marriage-algo';
import { Acceptor } from '../../matching-algo/stable-marriage-matching/marriage-types';
import { UserWithPrevMatchRecord } from '../../db/models/user_model';
import { templateMessageSender } from '../../zulip-messenger/msg-sender';

const MATCH_EMAILS = [];

const db = initDB();

MATCH_EMAILS.map(emailMatch => {
  return [
    db.User.findByEmail(emailMatch[0]),
    db.User.findByEmail(emailMatch[1])
  ];
}).forEach(matchPair => {
  const acceptor = matchPair[0];
  const suitor = matchPair[1];

  // Record matches in the user_match, match tables!
  const user_ids = [acceptor.id, suitor.id];
  db.UserMatch.addNewMatch(user_ids);

  console.log('\n==========');
  console.log(acceptor.full_name);
  console.log(suitor.full_name);

  templateMessageSender(acceptor.email, types.msgTemplate.TODAYS_MATCH, {
    full_name: suitor.full_name,
    first_name: suitor.full_name.split(' ')[0]
  });

  templateMessageSender(suitor.email, types.msgTemplate.TODAYS_MATCH, {
    full_name: acceptor.full_name,
    first_name: acceptor.full_name.split(' ')[0]
  });
});
