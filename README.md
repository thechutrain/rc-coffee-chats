# Coffee Chats 2.0 
[![Build Status](https://travis-ci.com/thechutrain/rc-coffee-chats.svg?branch=master)](https://travis-ci.com/thechutrain/rc-coffee-chats)
> Zulip bot that pairs Recursers for coffee chats

## Signing up  
Message the @chat-bot directly.

~~If you're looking to get paired for coffeechats you can subscribe to the coffee chat stream.~~

## Installing
#### With Docker
Before you get started, make sure you have docker on your local machine and have the daemon running. You can do a `docker info` to check if you're connected to the daemon.

```
docker build -t coffee . // builds the image
// you can do `docker images` to check that the coffee image is there

docker run -p 8080:8081 coffee // runs the image second port num is the internal port
```

#### Previous Way (without Docker)
Before you get started, make sure you have:

* a recent version of Node (10.x) 
* some version of SQLite3
* Python 2.7 (any recent version)

The `better-sqlite3` npm package requires Python 2 as a dependency. Python 3 will throw a syntax error. Things get even more complicated on Windows. Just make sure you can run Python 2.7 from the CLI.

The basic installation is what you'd expect: `npm install`.

After all of the `npm` packages have been installed, you'll want to create a `.env` file, probably by copying the example file

```
cp .env.example .env
```

You can configure it as you wish, but the default values should just work. The default database is `data/development.db` which is already configured in the `.env` file. To create it (since we're avoiding checking it in through our `.gitignore`), you just need to touch the file:

```
touch data/development.db
```

Once you've installed all the packages, copied the local environment file, and created the development database, you can run the tests to verify everything works:

```
npm test
```

and then start the server

```
npm run dev
```

Happy hacking!

## Goals
The current goal has now been to make Coffee Chat more robust and extensible so it can be easily maintained and additional features can be made with confidence. These goals include the following:

- [x] decoupling the code into separate modules
- [x] writing tests to ensure there are no regression bugs
- [ ] Using TypeScript for type safety and documentation
- [ ] adding features to make maintaince easier
  - [ ] automation of onboarding/offboarding
  - [ ] logging cronjobs to maintainers through zulip
  - [ ] allowing maintainers to update configurations (i.e. fallback user)
