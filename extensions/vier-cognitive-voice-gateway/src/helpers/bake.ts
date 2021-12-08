export function bakeData(obj: object) {
  return Object.entries(obj).map(([key, value]): [string, string] => {
    return [key, value.toString()];
  })
  .reduce((previous, [key, value]) => {
    return {
      ...previous,
      [key]: value
    };
  }, {});
}

export function bakeSipHeaders(obj: object) {
  let allHeaders = Object.entries(obj);
  if (allHeaders.every(([key]) => !key.startsWith('X-'))) {
    allHeaders = allHeaders.map(([key, value]) => [`X-${key}`, value]);
  }
  return allHeaders.map(([key, value]): [string, Array<string>] => {
    if (Array.isArray(value)) {
      return [key, [...value.map((val) => val.toString())]];
    }
    return [key, [value.toString()]];
  })
  .reduce((previous, [key, value]) => {
    return {
      ...previous,
      [key]: value
    };
  }, {});
}
