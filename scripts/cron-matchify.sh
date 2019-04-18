#!/usr/bin/env sh

# runs chron job for matching all users & sending zulip messages

cd ~/rc-coffee-chats
echo "" >> ~/cron-jobs/logs
cat << _BEGIN >> ~/cron-jobs/logs
============= START: MATCHIFY =================
  START TIMESTAMP @ `date`
_BEGIN

npm run cron-matchify >> ~/cron-jobs/logs

cat << _FINISH >> ~/cron-jobs/logs
  FINISH TIMESTAMP @ `date`
============= FINISHED: MATCHIFY =================
_FINISH


