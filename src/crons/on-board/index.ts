import * as dotenv from 'dotenv-safe';
dotenv.config();

import { onBoardUsers, getUsersToOnBoard } from './helpers';

// TESTING: so we can run this from package.json as a script
if (process.env.NODE_ENV === 'development') {
  console.log('In development, running handlePossibleOnBoarding()');
  handlePossibleOnBoarding();
}

export async function handlePossibleOnBoarding() {
  const users = await getUsersToOnBoard();
  const usersEmails = users.map(user => user.email);

  if (!users.length) {
    // Case: no users to on-board
    console.log('handlePossibleOnBoard(): no users to onboard');
    return;
  }

  onBoardUsers(usersEmails);
}
