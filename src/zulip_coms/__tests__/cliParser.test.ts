import { parseZulipServerRequest } from '../cliParser';
import { directives, subCommands, UpdateSubCommands } from '../cli.interface';

// tslint:disable-next-line
const sender_email = 'test@gmail.com';

describe('should be able to parse various zulip requests', () => {
  it('should return an error with empty content', () => {
    const fakeZulipRequest = {
      message: {
        type: 'private',
        sender_email,
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: ''
      }
    };

    let parsedDirective = null;
    let error = null;
    try {
      parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    } catch (e) {
      error = e;
    }

    expect(error).toBeNull();
    expect(parsedDirective).toMatchObject({
      directive: directives.HELP
    });
  });

  it('should return HELP action if thats the only DIRECTIVE', () => {
    const fakeZulipRequest = {
      message: {
        type: 'private',
        sender_email: 'ac@gmail.com',
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: `${directives.HELP}`
      }
    };

    let parsedDirective = null;
    let error = null;
    try {
      parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    } catch (e) {
      error = e;
    }

    expect(error).toBeNull();
    expect(parsedDirective).toMatchObject({
      directive: directives.HELP
    });
  });

  it('should return an error if given a non-valid DIRECTIVE', () => {
    const fakeZulipRequest = {
      message: {
        type: 'private',
        sender_email,
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: `NOT_VALID_DIRECTIVE`
      }
    };
    let parsedDirective = null;
    let error = null;
    try {
      parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    } catch (e) {
      error = e;
    }

    expect(error).toHaveProperty('errorType');
    expect(error).toMatchObject({
      senderEmail: sender_email,
      errorType: 'NOT A VALID DIRECTIVE'
    });
    expect(parsedDirective).toBeNull();
  });

  it('should return an error if give a NON valid SUBCOMMAND', () => {
    const fakeZulipRequest = {
      message: {
        type: 'private',
        sender_email,
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: `${directives.CHANGE} NOT_VAL_SUB_CMD`
      }
    };
    let parsedDirective = null;
    let error = null;
    try {
      parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    } catch (e) {
      error = e;
    }

    expect(error).toHaveProperty('errorType');
    expect(error).toMatchObject({
      senderEmail: sender_email,
      errorType: 'NOT A VALID SUBCOMMAND'
    });
    expect(parsedDirective).toBeNull();
  });

  it('should be valid with DIRECTIVE && SUBCMD', () => {
    const fakeZulipRequest = {
      message: {
        type: 'private',
        sender_email: 'ac@gmail.com',
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: `${directives.CHANGE} ${UpdateSubCommands.DAYS}`
      }
    };
    let parsedDirective = null;
    let error = null;
    try {
      parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    } catch (e) {
      error = e;
    }

    const expected = {
      directive: directives.CHANGE,
      subCommand: UpdateSubCommands.DAYS
    };

    expect(parsedDirective).toMatchObject(expected);
    expect(error).toBeNull();
  });

  it('should be valid with DIRECTIVE && SUBCMD with weird spacing', () => {
    // NOTE: does not handle issue with multiple spaces between words!!!
    const fakeZulipRequest = {
      message: {
        type: 'private',
        sender_email: 'ac@gmail.com',
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: `  ${directives.CHANGE}      ${UpdateSubCommands.DAYS}  `
      }
    };
    const parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    const expected = {
      directive: directives.CHANGE,
      subCommand: UpdateSubCommands.DAYS
    };

    expect(parsedDirective).toMatchObject(expected);
  });

  it('should be able to get a Directive, SubCmd, Args', () => {
    const fakeZulipRequest = {
      message: {
        type: 'private',
        sender_email: 'ac@gmail.com',
        sender_short_name: 'alancodes',
        sender_full_name: "Alan Chu (W1'18)",
        content: `  ${directives.CHANGE}   ${UpdateSubCommands.DAYS} a b `
      }
    };
    const parsedDirective = parseZulipServerRequest(fakeZulipRequest);
    const expected = {
      directive: directives.CHANGE,
      subCommand: UpdateSubCommands.DAYS,
      payload: ['A', 'B']
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
