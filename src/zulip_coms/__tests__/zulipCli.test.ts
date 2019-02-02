import { parseZulipServerRequest } from '../zulipCli';
import { directives, subCommands } from '../interface';

describe('should be able to parse various zulip requests', () => {
  it('should return an error with empty content', () => {
    const fakeZulipRequest = {
      message: {
        type: 'private',
        sender_email: 'ac@gmail.com',
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: ''
      }
    };

    const parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    const expected = {
      status: 'ERROR',
      errorType: 'NO VALID DIRECTIVE'
    };
    expect(parsedDirective).toMatchObject(expected);
  });

  it('should be abe to get the DIRECTIVE', () => {
    const fakeZulipRequest = {
      message: {
        type: 'private',
        sender_email: 'ac@gmail.com',
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: `${directives.CHANGE}`
      }
    };
    const parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    const expected = {
      status: 'ERROR',
      errorType: 'NO VALID SUBCOMMAND'
    };

    expect(parsedDirective).toMatchObject(expected);
  });

  // it('should be able to determine commands in a non-case sensitive way', () => {
  //   const fakeZulipReq1 = {
  //     message: {
  //       sender_short_name: 'alancodes',
  //       sender_full_name: "Alan Chu (W1'18)",
  //       content: 'uPdaTe --date 012'
  //     }
  //   };

  //   const fakeZulipReq2 = {
  //     message: {
  //       sender_short_name: 'alancodes',
  //       sender_full_name: "Alan Chu (W1'18)",
  //       content: 'upate --DaTe 012'
  //     }
  //   };

  //   const parsedDirective1 = parseZulipServerRequest(fakeZulipReq1);
  //   const parsedDirective2 = parseZulipServerRequest(fakeZulipReq1);

  //   const expectedUpdate = {
  //     command: cliCommands.UPDATE,
  //     payload: {
  //       '--DATE': '012'
  //     }
  //   };

  //   expect(parsedDirective1).toEqual(expectedUpdate);
  //   expect(parsedDirective2).toEqual(expectedUpdate);
  // });
});
