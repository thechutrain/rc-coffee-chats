#!/usr/bin/env sh

# runs chron job for sending out warnings that people will be matched the next day

cd ~/rc-coffee-chats
current_date_time=`date "+%Y-%m-%d %H:%M:%S"`;
echo "\n=================\nTime is: $current_date_time \nStarting warnings cron job ..." >> /root/cron-jobs/logs

npm run cron-warnings >> /root/cron-jobs/logs

current_date_time=`date "+%Y-%m-%d %H:%M:%S"`;
echo "\nFinished warnings cron job \n$current_date_time --> ran matchify chron :)\n============" >> root/cron-jobs/logs;
