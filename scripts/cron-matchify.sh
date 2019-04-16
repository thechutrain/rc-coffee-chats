#!/usr/bin/env sh

# runs chron job for matching all users & sending zulip messages

cd ~/rc-coffee-chats
current_date_time="`date +%Y-%m-%d %H:%M:%S`";
echo "\n=================\nTime is: $current_date_time \nStarting MATCHIFY cron job ..." > /root/cron-jobs/logs
npm run cron-matchify > /root/chron-logs
current_date_time="`date +%Y-%m-%d %H:%M:%S`";

echo "\nFinished MATCHIFY cron job \n$current_date_time --> ran matchify chron :)\n============" > root/cron-jobs/logs;
