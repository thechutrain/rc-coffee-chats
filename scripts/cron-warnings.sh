#!/usr/bin/env sh

# runs chron job for sending out warnings that people will be matched the next day

cd ~/rc-coffee-chats
echo "" >> ~/cron-jobs/logs
cat << BEGIN >> ~/cron-jobs/logs
============= START: WARNINGS-NOTIFICATIONS =================
  TIMESTAMP @ `date`
BEGIN

npm run cron-warnings >> ~/cron-jobs/logs

cat << FINISH >> ~/cron-jobs/logs
============= FINISH: WARNINGS-NOTIFICATIONS =================
  TIMESTAMP @ `date`
FINISH


