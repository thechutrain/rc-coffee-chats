export type email = string;

export interface IUser {
  email: string;
  full_name: string;
  prevMatches: email[];
  // hasBeenMatched: boolean
}

export interface IpastMatchObj {
  date: string;
  email1: string;
  email2: string;
}
