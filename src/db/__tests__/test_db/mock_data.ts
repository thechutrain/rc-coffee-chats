export const ALL_USERS = [
  {
    // id: 1
    email: 'user A',
    full_name: 'Matched to: BCD',
    coffee_days: '1'
  },
  {
    // id: 2
    email: 'user B',
    full_name: 'Matched to: A',
    skip_next_match: '1'
  },
  {
    // id: 3
    email: 'user C',
    full_name: 'Matched to: AD'
  },
  {
    // id: 4
    email: 'NOTACTIVE user D',
    full_name: 'Matched to: AC',
    is_active: '0'
  },
  {
    // id: 5,
    email: 'User E',
    full_name: 'Matched to: A'
  }
];

// export const user
export const MATCHES = [
  {
    user_ids: [1, 2],
    inputDate: '2019-01-01'
  },
  {
    user_ids: [1, 3],
    inputDate: '2019-02-02'
  },
  {
    user_ids: [1, 4],
    inputDate: '2019-03-03'
  },
  {
    user_ids: [2, 3],
    inputDate: '2019-02-02'
  },
  {
    user_ids: [1, 5],
    inputDate: '2019-04-04'
  }
];
