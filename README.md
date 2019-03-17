# Coffee Chats 2.0
> Zulip bot that pairs Recursers for coffee chats

## Introduction
- Get matched
- Get Coffee
- Get Chatty


#### Getting Your Developement Environment Setup
- `npm i` after cloning the repository to you machine.
- `mv .templateenv .env` and add all env keys. Chat with a maintainer.


## Product Road Map

#### Prep

#### Proposed Feature

- [ ] welcome message when you first subscribe

- [ ] Writing Tests (prioritize)

- [ ] Move database to Firebase (no relational db)

  - [ ] create test stream & test database

- [ ] End of batch confirmation message of do you want to continue with coffee chats?

- [ ] Revisit Matching Algorithm?

  - [ ] don't pair facilitators with each other
  - [ ] pairing new recursers with continuing recursers (first two weeks?)
  - [ ] allow users to set matching criteria (May be counter to coffee chat intention)
  - [ ] Date handling (use moment.js, date-fns? )

- [ ] Admin CLI for managing coffee chats bot:

  - [ ] getting recent logs, if it ran today, will run tomorrow
  - [ ] checking holidays, toggling on and off
  - [ ] change who the odd match facilitator is

- [ ] raincheck feature (if you get paired, but don't meet up, remove the matched record so they can be paired later)

- [ ] writing migration scripts, preserving existing data

- [ ] Propose moving the database to use postgres

- [ ] Front end interface for end users:

  - [ ] allow users to see who they've matched with
  - [ ] same features of zulip bot cli, in browser?

- [ ] make maintainer-notes markdown file

### Contributors
Todo ... (include previous glitch coffee chats)