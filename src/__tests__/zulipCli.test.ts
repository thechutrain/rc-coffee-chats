import { parseZulipServerRequest, cliCommands } from '../zulipCli';

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
      payload: []
    };
    expect(parsedDirective).toEqual(expected);
  });

  it('should assume UPDATE if only numbers are passed', () => {
    const fakeZulipRequest = {
      message: {
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: '0123'
      }
    };
    const parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    const expected = {
      command: cliCommands.UPDATE,
      payload: ['0123']
    };
    expect(parsedDirective).toEqual(expected);
  });

  it('should be able to determine commands in a non-case sensitive way', () => {
    // tslint:disable-next-line
    const fakeZulipRequest_update = {
      message: {
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: 'uPdaTe updatePayload'
      }
    };

    // tslint:disable-next-line
    const fakeZulipRequest_status = {
      message: {
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: 'status'
      }
    };

    const parsedDirectiveUpdate = parseZulipServerRequest(
      fakeZulipRequest_update
    );
    const parsedDirectiveStatus = parseZulipServerRequest(
      fakeZulipRequest_status
    );
    const expectedUpdate = {
      command: cliCommands.UPDATE,
      payload: ['updatePayload']
    };
    const expectedStatus = {
      command: cliCommands.STATUS,
      payload: []
    };

    expect(parsedDirectiveUpdate).toEqual(expectedUpdate);
    expect(parsedDirectiveStatus).toEqual(expectedStatus);
  });
});
