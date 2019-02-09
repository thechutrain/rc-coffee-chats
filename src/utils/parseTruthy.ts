export function parseTruthy(truthyStr: string): boolean {
  if (!truthyStr) {
    throw new Error(
      `Error! No truthy value provided. Please use "true" or "false"`
    );
  }

  const truthyStrCaps = truthyStr.toUpperCase();
  let booleanVal;
  switch (truthyStrCaps) {
    case '1':
    case 'TRUE':
    case 'YES':
    case 'y':
      booleanVal = true;
      break;
    case '0':
    case 'FALSE':
    case 'NO':
    case 'n':
      booleanVal = false;
      break;
    default:
      throw new Error(
        `Error parsing "${truthyStr}" as a boolean value. Please use "true" "yes" or "1" for truthy values and "false", "no", or "0" for falsey values.`
      );
  }

  return booleanVal;
}
