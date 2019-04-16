#!/usr/bin/env sh

# runs chron job for matching all users & sending zulip messages

cd ~/rc-coffee-chats
npm run chron-matchify > /root/chron-logs
current_date_time="`date +%Y-%m-%d %H:%M:%S`";
echo "\n$current_date_time --> ran matchify chron :)\n" > root/chron-logs;
