/**
 *  NOTE: not all Users are here for the full batch!
 *  - need to address the fact some batches (mini) end_date: true.
 *  - half batchers need to get notified 6 weeks earlier than the   end_date
 * TODO:
 * - find all users in the given batch
 * - find all active users who are in the current batch
 */
// export async function getUsersToOffBoard(batchId: number) {
//   const batchMembers = await getUsersFromBatch(batchId);
//   const activeChatUserEmails = db.User.findActiveUsers().map(
//     user => user.email
//   );

//   return activeChatUserEmails.filter(activeEmail => {
//     for (const batchMember of batchMembers) {
//       // TODO: check if its in half batch or not
//       if (activeEmail === batchMember.email) {
//         return true;
//       }
//     }
//     return false;
//   });
// }
