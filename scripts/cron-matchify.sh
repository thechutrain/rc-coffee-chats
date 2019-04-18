#!/usr/bin/env sh

# runs chron job for matching all users & sending zulip messages

cd ~/rc-coffee-chats
echo "" >> /root/cron-jobs/logs
cat << BEGIN >> /root/cron-jobs/logs
============= START: MATCHIFY =================
  TIMESTAMP @ `date`
BEGIN

npm run cron-matchify >> /root/cron-jobs/logs

cat << FINISH >> /root/cron-jobs/logs
============= START: cron-job =================
  TIMESTAMP @ `date`
FINISH


