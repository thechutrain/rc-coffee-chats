export type UserRecord = {
  id: number;
  email: string;
  full_name: string;
  coffee_days: string; // NOTE: or the enum days?
  warning_notification: boolean;
  skip_next_match: boolean;
  is_active: boolean;
  is_faculty: boolean;
  is_admin: boolean;
};

export type UserWithPrevMatchRecord = UserRecord & {
  prevMatches: PrevMatchRecord[];
} & {
  num_matches: number;
};

export type PrevMatchRecord = {
  id: number;
  email: string;
  full_name: string;
  date: string;
};

export type MatchRecord = {
  id: number;
  match_date: Date; // "YYYY-MM-DD"
  rain_checked: boolean;
};
