const zulip = require('zulip-js');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

const zulipConfig = {
  username: process.env.ZULIP_USERNAME,
  apiKey: process.env.ZULIP_API_KEY,
  realm: process.env.ZULIP_REALM
};

var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var db = new sqlite3.Database(dbFile);

//TODO: delete this once Chris has verified it worked ok!
const seedF1Emails = async () => {
  const zulipAPI = await zulip(zulipConfig);
  const users = (await zulipAPI.users.retrieve()).members;

  const f1users = Object.values(users).filter(user =>
    user.full_name.includes("F1'18")
  );
  const matches = [];
  const unmatchedUsers = f1users;

  while (unmatchedUsers.length > 0) {
    let currUser = unmatchedUsers.shift();
    unmatchedUsers.forEach(user => {
      matches.push([currUser.email, user.email]);
    });
  }
  console.log(matches.length);

  db.serialize(function() {
    matches.forEach(match => {
      db.run(
        `INSERT INTO matches(date, email1, email2) VALUES ("${
          new Date().toISOString().split('T')[0]
        }", "${match[0]}", "${match[1]}")`
      );
      console.log(match[0], match[1]);
    });
  });
};
