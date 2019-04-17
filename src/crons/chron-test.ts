const now = new Date();
const timeAsString = now.toLocaleTimeString('en-US', {
  timeZone: 'America/New_York'
});
const dateAsString = now.toLocaleDateString('en-US', {
  timeZone: 'America/New_York'
});
const chronLog = `Chron ran: ${dateAsString} @ ${timeAsString}`;
console.log('=================================\n' + chronLog + '\n');
