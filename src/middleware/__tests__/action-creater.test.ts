import * as types from '../../types';
// import { getActionFromRegex, getActionFromCli } from '../action-creater';
import {
  isAnAliasCommand,
  getActionFromAlias,
  parseContentAsCli,
  createAction
} from '../action-creater';

describe('parseContent helper fn:', () => {
  it('should be able to parse a command', () => {
    const parsedCli = parseContentAsCli(`/update skip true`);

    expect(parsedCli).toEqual({
      directive: 'UPDATE',
      subcommand: 'SKIP',
      args: ['true']
    });
  });

  it('should be able to parse a command even if there is no forward slash', () => {
    const parsedCli = parseContentAsCli(`update skip true`);

    expect(parsedCli).toEqual({
      directive: 'UPDATE',
      subcommand: 'SKIP',
      args: ['true']
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
    expect(actionObj.actionArgs).toEqual({ rawInput: ['true'] });
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
    expect(actionObj.actionArgs).toEqual({ rawInput: ['true'] });
  });

  it('should still be able to update an action even without the / command', () => {
    const actionObj = createAction('update skip true');
    expect(actionObj).toHaveProperty('actionType', types.Action.UPDATE__SKIP);
    expect(actionObj.actionArgs).toEqual({ rawInput: ['true'] });
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
