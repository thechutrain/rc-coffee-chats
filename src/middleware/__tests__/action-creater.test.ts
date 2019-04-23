import * as types from '../../types';
import { getActionFromRegex, getActionFromCli } from '../action-creater';

describe('action-creater tests:', () => {
  it('should be able to create the BOT__HI action', () => {
    const actionObj = getActionFromRegex('hi');
    expect(actionObj).toHaveProperty('actionType', types.Action.BOT__HI);
  });

  it('should be able to create the BOT__HI action, despite capitalization or spacing issues', () => {
    const actionObj = getActionFromRegex(' hoWdYY');
    expect(actionObj).toHaveProperty('actionType', types.Action.BOT__HI);
  });

  it('should be able to create the UDPATE_SKIP action', () => {
    const actionObj = getActionFromRegex(' cancel next match');
    expect(actionObj).toHaveProperty('actionType', types.Action.UPDATE__SKIP);
    expect(actionObj.actionArgs).toEqual({ rawInput: ['TRUE'] });
  });
});
