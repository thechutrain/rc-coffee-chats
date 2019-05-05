export type rc_batch = {
  id: number;
  name: string;
  start_date: string; // '2019-06-27'
  end_date: string;
};

export type rc_stint = {
  type: 'retreat' | 'employment';
  start_date: string;
  end_date: string | null;
  in_progress?: boolean; // docs look like this may not be in batches from 2016?
  for_half_batch?: boolean; // docs look like this may not be in batches from 2016?
};

export type rc_profile = {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  stints: rc_stint[];
};
