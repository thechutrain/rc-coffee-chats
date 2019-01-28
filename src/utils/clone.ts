// source: https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
export function deepClone(obj: any) {
  // let copy: Object | Date; // throws error with copy.setTime b/c it has Object
  let copy: any;

  // check if primitive value, then return (base case of recursive deepClone)
  if (typeof obj !== 'object' || obj == null) return obj;

  // copying if its a date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    obj.forEach((elem: any, index: number) => {
      copy[index] = deepClone(elem);
    });
    return copy;
  }

  // Handle Obj
  if (obj instanceof Object) {
    copy = {};
    for (const attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = deepClone(obj[attr]);
      }
    }
    return copy;
  }
}

export function extend(...args: any[]) {
  const extendedObj: any = {};

  // for (let i = 0; i < arguments.length; i += 1) {
  for (const obj of arguments) {
    if (!(obj instanceof Object)) break;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        extendedObj[key] = deepClone(obj[key]);
      }
    }
  }

  return extendedObj;
}
