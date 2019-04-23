import * as types from '../../types';
import { getActionFromRegex, getActionFromCli } from '../action-creater';

describe('action-creater tests:', () => {
  it('should be able to create the BOT__HI action', () => {
    // expect(true).toBe(true);
    const actionObj = getActionFromRegex('hi');
    expect(actionObj).toBe(types.Action.BOT__HI);
  });

  // it('should be able to create the UDPATE_ action', () => {
  //   // expect(true).toBe(true);
  //   const actionObj = getActionFromRegex('hi');
  //   expect(actionObj).toBe(types.Action.BOT__HI);
  // });
});
