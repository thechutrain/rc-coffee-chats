# Coffee Chats 2.0 
[![Build Status](https://travis-ci.com/thechutrain/rc-coffee-chats.svg?branch=master)](https://travis-ci.com/thechutrain/rc-coffee-chats) <a href='http://www.recurse.com' title='Made with love at the Recurse Center'><img src='https://cloud.githubusercontent.com/assets/2883345/11325206/336ea5f4-9150-11e5-9e90-d86ad31993d8.png' height='20px'/></a>
> Zulip bot that pairs Recursers for coffee chats

## Commands and Documentation
For a full list of commands see the [wiki page](https://github.com/thechutrain/rc-coffee-chats/wiki/)

## Signing up  
Just say hi directly to `@chat-bot`. 

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

