import { shuffle } from 'lodash';

type email = string;

interface IUser {
  email: string;
  prevMatches: email[];
}

// export function makeMatches(usersToMatch: IUser[]): [IUser, IUser][] {
// return  []
// }

interface IpastMatchObj {
  date: string;
  email1: string;
  email2: string;
}

export function _prevMatchingAlgo(
  emails: email[],
  pastMatches: IpastMatchObj[],
  oddNumberBackupEmails = ['oddEmail@rc.com']
): Array<[string, string]> {
  // const unmatchedEmails = shuffle(emails); //
  const unmatchedEmails = emails; //
  const newMatches = [];

  // console.log("-----------------------");
  // console.log("unmatchedEmails:");
  // console.log(unmatchedEmails);
  // console.log("-----------------------");

  while (unmatchedEmails.length > 0) {
    const currentEmail = unmatchedEmails.shift();

    // console.log("-----------------------");
    // console.log("currentEMail:");
    // console.log(currentEmail);
    // console.log("-----------------------");

    /**
     *
     *
     *
     */
    const pastMatchedEmails = pastMatches
      .filter(
        match => match.email1 === currentEmail || match.email2 === currentEmail
      ) // filter to current email's matches
      .sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date))) // sort oldest to newest, so if there is a conflict we can rematch with oldest first
      .map(match =>
        match.email1 === currentEmail ? match.email2 : match.email1
      ) // extract only the other person's email out of the results (drop currentEmail and date)
      .filter(email => unmatchedEmails.includes(email)) // remove past matches who are not looking for a match today or who already got matched
      .filter((value, index, self) => self.indexOf(value) === index); // uniq emails // TODO: this should be a reduce that adds a match count to every email so we can factor that into matches

    // console.log("------- pastMatchedEmails: ");
    // console.log(pastMatchedEmails);
    // console.log("-----------------------");

    const availableEmails = unmatchedEmails.filter(
      email => !pastMatchedEmails.includes(email)
    );

    if (availableEmails.length > 0) {
      // TODO: potentialy prioritize matching people from different batches
      newMatches.push([currentEmail, availableEmails[0]]);
      unmatchedEmails.splice(unmatchedEmails.indexOf(availableEmails[0]), 1);
    } else if (pastMatchedEmails.length > 0 && unmatchedEmails.length > 0) {
      newMatches.push([currentEmail, pastMatchedEmails[0]]);
      unmatchedEmails.splice(unmatchedEmails.indexOf(pastMatchedEmails[0]), 1);
    } else {
      // this should only happen on an odd number of emails
      // TODO: how to handle the odd person
      newMatches.push([
        currentEmail,
        oddNumberBackupEmails[
          Math.floor(Math.random() * oddNumberBackupEmails.length)
        ]
      ]);
    }
    // logger.info("<<<<<<", newMatches);
  }
  return newMatches;
}
