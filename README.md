# Coffee Chats 2.0

> Zulip bot that pairs Recursers for coffee chats

## Introduction
- Get matched
- Get Coffee
- Get Chatty


#### Getting Your Developement Environment Setup
- `npm i` after cloning the repository to you machine.
- `mv .templateenv .env` and add all env keys. Chat with a maintainer.

#### Getting The Development Server Running
- Get a PostGres db running.  If you're using a mac: (Posgres for mac)[https://www.postgresql.org/download/macosx/] and (Postico)[https://eggerapps.at/postico/] are great free tools to interact with PostGres.
- 


## Product Road Map

#### Prep

- [x] move glitch project to github
- [x] make readme, with todo list
- [x] project formating setup (prettier, githooks)
- [x] add typescript:
  - [x] setup compiler
  - [x] set up tslint
- [x] set up jest
- [ ] Code reorganization: splitting into db, matching algorithm, server/router
- [ ] Test deploy to now Zeit
- [ ] Design database schema (archive users)

#### RC Hackathon

[TBD]

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

#### Other Ideas

- Virtual Coffee Chats! (liz)

### Learning Goals

- Greg: Firebase, TypeScript
- Liz: TypeScript, Zulip bots
- Alan: Refactoring, Teamwork

### Contributors

Todo ... (include previous glitch coffee chats)

## RC-specific Messages

tl;dr: Subscribe yourself to the #**Coffee Chats** Zulip Channel if you'd like to start getting paired for daily coffee chats!

Hi everyone! From tomorrow morning, we'll be kicking off coffee chat pairings (Mon-Thur). These are a great way to get matched with someone else at RC, to chat about anything and everything - from what you'll be doing at RC to what you're doing in life. Coffee itself isn't required - it could be tea, or snacks, or just a walk - and you don't even have to leave the building if you just want to catch up in the kitchen or somewhere else on the 4th floor.

It's really simple to get paired - just subscribe to the Zulip channel #**Coffee Chats**. If you're in there at 10am on any given day, we'll pair you up with someone new (expect the message at 10:30am each day). If you're sick that day and forget to remove yourself, don't worry! You can just meet with the person you paired with once you're back.

Feel free to add or remove yourself at any point, (just try to do so before 10am if you don't want to have coffee that day). Thanks and happy chatting!
