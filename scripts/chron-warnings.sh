#!/usr/bin/env sh

# runs chron job for sending out warnings that people will be matched the next day

cd ~/rc-coffee-chats
npm run chron-warnings> /root/chron-logs
current_date_time="`date +%Y-%m-%d %H:%M:%S`";
echo "\n$current_date_time --> ran matchify chron :)\n" > root/chron-logs;
