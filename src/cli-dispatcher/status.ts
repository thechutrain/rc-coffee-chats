import * as types from '../types';

export class Status {
  private db: any;

  constructor(db) {
    this.db = db;
  }

  public dispatch(
    subCommand: string | null,
    args: any[],
    targetEmail?: string
  ): any {
    // Get All the dispatchable methods:
    const nonDispatchableMethods = ['constructor', 'dispatch'];
    const proto = Reflect.getPrototypeOf(this);
    const dispatchableMethods = Reflect.ownKeys(proto).filter(
      (f: string) => nonDispatchableMethods.indexOf(f) === -1
    );

    // TEMP:
    const subCmd = subCommand === null ? 'days' : subCommand.toLowerCase();
    const isValidSubCmd = dispatchableMethods.indexOf(subCmd) !== -1;

    // let messageType;
    let messageContent;

    // Case: valid subcommand
    if (isValidSubCmd) {
      try {
        messageContent = this[subCmd].call(this, args);
      } catch (e) {
        messageContent = `Error trying to invoke: ${subCmd}`;
        console.log(messageContent);
      }
    }
    // else if (this.defaultSubCmd) {
    //   console.log('doing the default sub command');
    // }
    else {
      // not a valid subcommand & no default subcommand
      console.log('not a valid subcommand');
    }
  }

  public days(rawArgs, targetUser) {
    const userDays = this.db.user.getCofeeDays(targetUser);

    console.log('days was invoked!!');
    return 'MON TUE WED';
  }

  public warnings() {
    console.log('warnings was invoked');
  }

  public skip() {
    console.log('skip was invoked');
  }
}
