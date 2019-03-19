import { debug } from 'util';

export class Status {
  private db: any;

  constructor(db) {
    this.db = db;
  }

  public dispatch(subCommand: string, args: any[]) {
    // Get All the dispatchable methods:
    const nonDispatchableMethods = ['constructor', 'dispatch'];
    const proto = Reflect.getPrototypeOf(this);
    const dispatchableMethods = Reflect.ownKeys(proto).filter(
      (f: string) => nonDispatchableMethods.indexOf(f) === -1
    );

    // Check if subCmd is valid
    const subCmd = subCommand.toLowerCase();
    const isValidSubCmd = dispatchableMethods.indexOf(subCmd) !== -1;

    // Case: valid subcommand
    if (isValidSubCmd) {
      let dispatchResult;
      try {
        dispatchResult = this[subCmd]();
      } catch (e) {
        console.log(`Error trying to invoke: ${subCmd}`);
        // dispatchResult = {
        //   error: true,
        //   errorMsg: ''
        // };
      }

      return dispatchResult;
    }
    // else if (this.defaultSubCmd) {
    //   console.log('doing the default sub command');
    // }
    else {
      // not a valid subcommand & no default subcommand
      console.log('not a valid subcommand');
    }
  }

  public days(): string {
    // debug.user.find()
    console.log('days was invoked!!');
    return 'MON TUE WED';
  }
}

// new Status('db');
// const s = new Status();
// s.dispatch('DAY');
