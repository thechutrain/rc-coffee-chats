/**
 * find user who hasn't matched with
 */
import * as mTypes from '../../matching-algo/stable-marriage-matching/marriage-types';
import { shuffle } from 'lodash';

let a = [{ data: 'a' }, { data: 'b' }, { data: 'c' }, { data: 'd' }];
let c = a;
let b = shuffle(a);
b[0].data = 'asdfasdfa';

console.log(a);
console.log(b);
console.log(a === c);
console.log(b === c);

// export function createSuitorAcceptorPool<A>(
//   users: A[],
//   fallBackPerson: A
// ): {
//   suitors: Map<mTypes.marriage_id, mTypes.Suitor<A>>;
//   acceptors: Map<mTypes.marriage_id, mTypes.Acceptor<A>>;
//   fallBackMatch?: A;
// } {
//   if (isEvenNumberUsers(users)) {
//   }

//   return {};
// }

export function isEvenNumberUsers<A>(people: A[]): boolean {
  return people.length % 2 === 0;
}
