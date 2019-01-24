import { parseZulipServerRequest, cliCommands, payloadFlags } from '../zulipCli';

describe('should be able to parse various zulip requests', () => {
  it('should assume HELP if nothing is passed', () => {
    const fakeZulipRequest = {
      message: {
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: ''
      }
    };
    const parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    const expected = {
      command: cliCommands.HELP,
      payload: {} 
    };
    expect(parsedDirective).toEqual(expected);
  });

  it('should assume UPDATE if only numbers are passed', () => {
    const fakeZulipRequest = {
      message: {
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: 'UPDATE'
      }
    };
    const parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    const expected = {
      command: cliCommands.UPDATE,
      payload: {}
    };
    expect(parsedDirective).toEqual(expected);
  });

  it('should be able to determine commands in a non-case sensitive way', () => {
    const fakeZulipReq1 = {
      message: {
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: 'uPdaTe --date 012'
      }
    };

    const fakeZulipReq2 = {
      message: {
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: 'upate --DaTe 012'
      }
    };

    const parsedDirective1 = parseZulipServerRequest(
      fakeZulipReq1
    );
    const parsedDirective2 = parseZulipServerRequest(
      fakeZulipReq1
    );

    const expectedUpdate = {
      command: cliCommands.UPDATE,
      payload: {
        '--DATE': '012'
      }
    };

    expect(parsedDirective1).toEqual(expectedUpdate);
    expect(parsedDirective2).toEqual(expectedUpdate);
  });
});


// TODO: write test for multiple arguments