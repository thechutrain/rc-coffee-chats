import * as rctypes from '../../recurse-api/rctypes';

/** check each base to determine if it should offboard users who are leaving
 *
 * @param batches
 */
export function handlePossibleOffboarding(batches: rctypes.rc_batch[]) {
  // NOTE: need to check if its the last day for any of these users
  // Its the last day! Off-board active users.
  /** TODO:
   * - determine if the batch is a mini or regular
   * - determine if the batch is has people leaving or not
   * - if people are leaving, then get the users who are leaving && also use chat bot.
   * - deactivate them
   * - notify them they have been deactivated,
   * - warn matinainer that today is the last day of the batch? And everything is Okay. hopefully ...
   *
   */
}
