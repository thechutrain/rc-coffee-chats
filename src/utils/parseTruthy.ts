export function parseTruthy(truthyStr: string): boolean {
  const truthyStrCaps = truthyStr.toUpperCase();
  let booleanVal;
  switch (truthyStrCaps) {
    case '1':
    case 'TRUE':
    case 'YES':
      booleanVal = true;
      break;
    case '0':
    case 'FALSE':
    case 'NO':
      booleanVal = false;
      break;
    default:
      throw new Error(
        `Error parsing "${truthyStr}" as a boolean value. Please use "true" "yes" or "1" for truthy values and "false", "no", or "0" for falsey values.`
      );
  }

  return booleanVal;
}
