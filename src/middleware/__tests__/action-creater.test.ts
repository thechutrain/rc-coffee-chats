import * as types from '../../types';
// import { getActionFromRegex, getActionFromCli } from '../action-creater';
import {
  isAnAliasCommand,
  getActionFromAlias,
  parseContentAsCli,
  createAction
} from '../action-creater';

// describe('action-creater tests:', () => {
//   it('should be able to create the BOT__HI action', () => {
//     const actionObj = getActionFromRegex('hi');
//     expect(actionObj).toHaveProperty('actionType', types.Action.BOT__HI);
//   });

//   it('should be able to create the BOT__HI action, despite capitalization or spacing issues', () => {
//     const actionObj = getActionFromRegex('hoWdY');
//     expect(actionObj).toHaveProperty('actionType', types.Action.BOT__HI);
//   });

//   it('should be able to create the UDPATE_SKIP action', () => {
//     const actionObj = getActionFromRegex('cancel next match');
//     expect(actionObj).toHaveProperty('actionType', types.Action.UPDATE__SKIP);
//     expect(actionObj.actionArgs).toEqual({ rawInput: ['TRUE'] });
//   });

//   it('should not create UPDATE_SKIP action for UPDATE SKIPPING False', () => {
//     const actionObj = getActionFromRegex('UPDATE SKIPPING False');
//     expect(actionObj).toBeNull();
//   });
// });

describe('parseContent helper fn:', () => {
  it('should be able to parse a command', () => {
    const parsedCli = parseContentAsCli(`/update skip true`);

    expect(parsedCli).toEqual({
      directive: 'UPDATE',
      subcommand: 'SKIP',
      args: ['TRUE']
    });
  });

  it('should be able to parse a command even if there is no forward slash', () => {
    const parsedCli = parseContentAsCli(`update skip true`);

    expect(parsedCli).toEqual({
      directive: 'UPDATE',
      subcommand: 'SKIP',
      args: ['TRUE']
    });
  });
});

describe('isAnAliasCommand() helper fn:', () => {
  it('should be able to determine that its a full cli cmd', () => {
    const isAlias = isAnAliasCommand('/update ');

    expect(isAlias).toBe(false);
  });

  it('should be able to determine that its an alias cmd', () => {
    const isAlias = isAnAliasCommand('skip');

    expect(isAlias).toBe(true);
  });
});

describe('new action creater:', () => {
  /**
   * Case 1: "/"
   *  a) valid command
   *  b) not a valid command
   *
   * Case 2: no "/"
   *  a) valid command
   *  b) not a valid command
   */

  it('should be able to create valid action from a full cli cmd', () => {
    const actionObj = createAction('skip');
    expect(actionObj).toHaveProperty('actionType', types.Action.UPDATE__SKIP);
    expect(actionObj.actionArgs).toEqual({ rawInput: ['TRUE'] });
  });

  it('should throw an error with a non-valid cli cmd', () => {
    let error = null;
    try {
      createAction('noasdfa');
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
  });

  it('should be able to create an action that is an alias', () => {
    const actionObj = createAction('/update skip true');
    expect(actionObj).toHaveProperty('actionType', types.Action.UPDATE__SKIP);
    expect(actionObj.actionArgs).toEqual({ rawInput: ['TRUE'] });
  });

  it('should still be able to update an action even without the / command', () => {
    const actionObj = createAction('update skip true');
    expect(actionObj).toHaveProperty('actionType', types.Action.UPDATE__SKIP);
    expect(actionObj.actionArgs).toEqual({ rawInput: ['TRUE'] });
  });

  it('should throw an error with a non-valid alias command', () => {
    let error = null;
    try {
      createAction('/updat sbasdfa');
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
  });
});
