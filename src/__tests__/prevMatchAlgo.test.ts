import { _prevMatchingAlgo } from '../matchAlgo';

/**
 * List of tests:
 * -
 */
describe('Previous ', () => {
  it('empty emails to match and no past matches should give us no matched users', () => {
    const arrEmailsToMatch = [];
    const allPastMatches = [];
    const receivedValue = _prevMatchingAlgo(arrEmailsToMatch, allPastMatches);
    const expectedValue = [];

    expect(receivedValue).toEqual(expectedValue);
  });

  it('even # of users should not return the fallback person', () => {
    const arrEmailsToMatch = ['a', 'b'];
    const allPastMatches = [];
    const receivedValue = _prevMatchingAlgo(arrEmailsToMatch, allPastMatches);
    const expectedValue = [['a', 'b']];

    expect(receivedValue).toEqual(expectedValue);
  });

  it('odd # of users should return the fallback person', () => {
    const arrEmailsToMatch = ['a', 'b', 'c'];
    const allPastMatches = [];
    const receivedValue = _prevMatchingAlgo(arrEmailsToMatch, allPastMatches, [
      'odd'
    ]);
    const expectedValue = [['a', 'b'], ['c', 'odd']];

    expect(receivedValue).toEqual(expectedValue);
  });

  it('respects previous matches for first user that it tries to match', () => {
    const arrEmailsToMatch = ['a', 'b', 'c'];
    const allPastMatches = [
      {
        date: '2019-01-25',
        email1: 'a',
        email2: 'b'
      }
    ];
    const receivedValue = _prevMatchingAlgo(arrEmailsToMatch, allPastMatches, [
      'odd'
    ]);
    const expectedValue = [['a', 'c'], ['b', 'odd']];

    expect(receivedValue).toEqual(expectedValue);
  });
});
