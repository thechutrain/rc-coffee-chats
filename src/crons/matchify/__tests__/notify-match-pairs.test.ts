import { buildNotifications } from '../notify-match-pair'
import { matchPair } from '../../../db/models/user_model';

// Mock Data:
let matchAl;
let matchBob;
let matchCat;

describe('buildNotifications(): ', () => {
  beforeAll(() => {
    // Mocks
    matchAl = {
      id: 1,
      email: 'al@email.com',
      full_name: 'al gore',
      coffee_days: '12',
      warning_exception: 1,
      skip_next_match: 0,
      is_active: 1,
      is_faculty: 0,
      is_admin: 0,
      prevMatches: [],
      num_matches: 0
    } ;

    matchBob = {
      id: 1,
      email: 'bob@email.com',
      full_name: 'bob dylan',
      coffee_days: '12',
      warning_exception: 1,
      skip_next_match: 0,
      is_active: 1,
      is_faculty: 0,
      is_admin: 0,
      prevMatches: [],
      num_matches: 0
    };
    matchCat = {
      id: 1,
      email: 'cat@email.com',
      full_name: 'cat stevens',
      coffee_days: '12',
      warning_exception: 1,
      skip_next_match: 0,
      is_active: 1,
      is_faculty: 0,
      is_admin: 0,
      prevMatches: [],
      num_matches: 0
    };
  });

  it('should work for two person matches', () => {
      let userMatches: matchPair = [matchAl, matchBob];
      let [emailList, msg] = buildNotifications(userMatches);
      expect(emailList.length).toBe(userMatches.length);
      expect(msg.includes("two of you"));
  })
  it('should work for three person matches', () => {
      let userMatches: matchPair = [matchAl, matchBob, matchCat];
      let [emailList, msg] = buildNotifications(userMatches);
      expect(emailList.length).toBe(userMatches.length);
      expect(msg.includes("three person"));
  }