#!/usr/bin/env sh

# runs chron job for sending out warnings that people will be matched the next day

cd ~/rc-coffee-chats
echo "" >> ~/cron-jobs/logs
cat << _BEGIN >> ~/cron-jobs/logs
============= START: WARNINGS-NOTIFICATIONS =================
> START TIMESTAMP @ `date`
_BEGIN

npm run cron-warnings >> ~/cron-jobs/logs

cat << _FINISH >> ~/cron-jobs/logs
> FINISHED TIMESTAMP @ `date`
============= FINISH: WARNINGS-NOTIFICATIONS =================
_FINISH


