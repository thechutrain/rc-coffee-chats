## crontab -e file:
0 8 * * * /root/chron-matchify.sh 
0 19 * * * /root/chron-warnings.sh
0 * * * * ~/cron/hourly.sh


# NOTE: must set up crontab on the linux machine:
# 1) cd into root/
# 2) chomd +x matchify.sh
# 3) chmod +x warnings.sh
# 3) move the both files to the root directory
# 4) make a root/chron-logs file
# 5) $ crontab -e
# 6) paste the above chron log into crontab -e file`
# 7) $ crontab -l   --> to double check that its there
