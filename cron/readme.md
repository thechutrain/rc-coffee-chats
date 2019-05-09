## Crontab
> This directory holds important shell scripts for running a cron

#### Background :
The current version of chat bot uses the server's crontab in order to run the `hourly.sh` tab, you guessed it - hourly. This script will then call an npm script that will run the `src/cron/index.ts` file. That way it will be easier for the developer to programmatically add changes to frequency or time a function gets run, as opposed to having access to the droplet and messing with crontab.

#### Initial set up
Before setting up crons for the first time, you must have access to the server. 

1. Type `crontab -e` to open the crontab file
2. Copy and paste the following into the crontab file:
  ```
  0 * * * * ~/cron/hourly.sh
  ```
  If you need to adjust the cron to run more frequently, you can update this command. [crontab.guru](https://crontab.guru/)  is a great site to test how frequently your cron runs.

3. From the root directory of this project type: `cp -r cron/ ../`

#### Trouble shooting
* Ensure that the `hourly.sh` has execution priviledge. You can do `chmod +x cron-hourly.sh` to change the priviledges so it can be executed.

* If the name of the project name changes from `rc-coffee-chats` then change the directory name that you are `cd`ing in the `hourly.sh` file.