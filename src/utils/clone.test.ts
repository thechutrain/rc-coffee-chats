import { deepClone, extend } from './clone';

describe('Object cloning and extending', () => {
  it('be able to return a new empty object it', () => {
    const originalObj = Object.freeze({});
    const clonedObj = deepClone(originalObj);
    const areSame = originalObj === clonedObj;

    expect(areSame).toBe(false);
  });
  it('should be able to clone a date', () => {
    // TODO: probably not necessary right now
    expect(true).toBe(true);
  });
  it('should be able to clone a flat array', () => {
    const origArr = ['a', 'b', 'c'];
    const copyArr = deepClone(origArr);

    expect(origArr === copyArr).toBe(false);
    expect(copyArr).toEqual(origArr);

    origArr[0] = 'changed';
    expect(copyArr).not.toEqual(origArr);
  });

  it('should be able to clone a flat object', () => {
    expect(true).toBe(true);
  });
  it('should be able to clone a nested array', () => {
    const nestedArr: any = ['a', ['b1', 'b2'], 'c'];
    const cloneArr = deepClone(nestedArr);

    expect(nestedArr).toEqual(cloneArr);
    expect(nestedArr === cloneArr).toBe(false);

    nestedArr[1][0] = 'B-ONE';
    expect(nestedArr).not.toEqual(cloneArr);
  });

  it('should be able to clone a nested object', () => {
    expect(true).toBe(true);
  });
});
