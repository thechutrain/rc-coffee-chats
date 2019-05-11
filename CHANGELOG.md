# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2017-05-11
### Added
- 🚀 automated off-boarding of RC members leaving their batch, using RC API. Also, automated the onboard invitation of RC members.
- `Config` table for storing the fallbackuser email; admin users can update the fallbackuser.
- send messages to users in a group message now
- added a `deactivate` short hand command as an alias to `update active false`.
- added a changelog 😎

### Changed
- separate cron job `.sh` files to a single entry point for cron jobs; `cron-hourly.sh` file will call the `src/crons/hourly.ts` file hourly


### Security
- validating all requests with the chat-bot user token. Fixes the security vulnerability where you could have `curl` directly to the chat bot server and changed a user's settings.