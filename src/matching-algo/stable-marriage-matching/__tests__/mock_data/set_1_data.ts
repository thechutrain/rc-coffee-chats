import { marriage_id } from '../../marriage-types';

////////////////////////////////////////
// Data
////////////////////////////////////////
export interface IMarriagePerson<T> {
  data: T;
  marriage_id: marriage_id;
  priority: marriage_id[];
}

/** Male Suitors:
 *  Alfred, Bob, Chris, Dan
 */
export type person = {
  name: string;
  _id: number;
};
export const m_a: person = {
  name: 'Alfred',
  _id: 1
};

export const m_b: person = {
  name: 'Bob',
  _id: 2
};
export const m_c: person = {
  name: 'Chris',
  _id: 3
};
export const m_d: person = {
  name: 'Dan',
  _id: 4
};

/** Female Acceptors:
 *  Allison, Bri, Cynthia, Diana
 */
export const w_a: person = {
  name: 'Allison',
  _id: 11
};

export const w_b: person = {
  name: 'Bri',
  _id: 12
};

export const w_c: person = {
  name: 'Cynthia',
  _id: 13
};

export const w_d: person = {
  name: 'Diana',
  _id: 14
};

export const men = [m_a, m_b, m_c, m_d];
export const women = [w_a, w_b, w_c, w_d];
