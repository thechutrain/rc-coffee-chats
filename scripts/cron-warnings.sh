#!/usr/bin/env sh

# runs chron job for sending out warnings that people will be matched the next day

cd ~/rc-coffee-chats
echo "" >> /root/cron-jobs/logs
cat << BEGIN >> /root/cron-jobs/logs
============= START: WARNINGS-NOTIFICATIONS =================
  TIMESTAMP @ `date`
BEGIN

npm run cron-warnings >> /root/cron-jobs/logs

cat << FINISH >> /root/cron-jobs/logs
============= START: cron-job =================
  TIMESTAMP @ `date`
FINISH


