import { marriage_id } from '../../marriage-types';

////////////////////////////////////////
// Data
////////////////////////////////////////
interface IMarriagePerson<T> {
  data: T;
  marriage_id: marriage_id;
  priority: marriage_id[];
}

/** Male Suitors:
 *  Alfred, Bob, Chris, Dan
 */
export const m_a: IMarriagePerson<string> = {
  data: 'Alfred',
  marriage_id: 1,
  priority: []
};

export const m_b: IMarriagePerson<string> = {
  data: 'Bob',
  marriage_id: 2,
  priority: []
};
export const m_c: IMarriagePerson<string> = {
  data: 'Chris',
  marriage_id: 3,
  priority: []
};
export const m_d: IMarriagePerson<string> = {
  data: 'Dan',
  marriage_id: 4,
  priority: []
};

/** Female Acceptors:
 *  Allison, Bri, Cynthia, Diana
 */
export const w_a: IMarriagePerson<string> = {
  data: 'Allison',
  marriage_id: 11,
  priority: []
};

export const w_b: IMarriagePerson<string> = {
  data: 'Bob',
  marriage_id: 12,
  priority: []
};

export const w_c: IMarriagePerson<string> = {
  data: 'Cynthia',
  marriage_id: 11,
  priority: []
};

export const w_d: IMarriagePerson<string> = {
  data: 'Allison',
  marriage_id: 11,
  priority: []
};

export const men = [m_a, m_b, m_c, m_d];
export const women = [w_a, w_b, w_c, w_d];
