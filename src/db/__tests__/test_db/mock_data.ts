export const ALL_USERS = [
  {
    // id: 1
    email: 'user A',
    full_name: 'Matched to: BCD',
    coffee_days: '0123456'
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
    full_name: 'Matched to: AD',
    coffee_days: '0123456'
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
  },
  {
    email: 'User F',
    full_name: 'Not matched with anyone',
    coffee_days: '0',
    skip_next_match: '1'
  },
  // Testing the warning exception
  {
    email: 'User needs to be warned',
    full_name: 'user with warning exception',
    coffee_days: '5',
    warning_exception: '1'
  },
  {
    email: 'User needs to be warned, but is skipping',
    full_name: 'no msg should be sent',
    coffee_days: '5',
    warning_exception: '1',
    skip_next_match: '1'
  },
  {
    email: 'User is NOT active, but has warnings',
    full_name: 'no msg should be sent',
    coffee_days: '5',
    warning_exception: '1',
    is_active: '0'
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
