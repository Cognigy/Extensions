export function normalizeText(text) {
  if (!text) {
    return undefined;
  }
  const trimmed = !text.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed;
}

export function convertWhisperText(text) {
  if (!text) {
    return undefined;
  }
  text = text.trim();
  if (!text) {
    return undefined;
  }
  return {
    text: text,
  };
}

export function convertRingTimeout(timeout: number | undefined) {
  if (!timeout) {
    return undefined;
  }
  return timeout * 1000;
}

export function normalizeData(dataObject: object | undefined) {
  if (!dataObject) {
    return dataObject;
  }

  let entries = Object.entries(dataObject);
  if (entries.length == 0) {
    return undefined;
  }

  let output = {};
  for (const [key, value] of entries) {
    output[key] = `${value}`;
  }
  return output;
}

export function normalizeSipHeaders(headersObject: object | undefined) {
  if (!headersObject) {
    return headersObject;
  }

  let headerPairs = Object.entries(headersObject);
  if (headerPairs.length == 0) {
    return undefined;
  }

  let hasPrefixes = headerPairs.some(([name]) => name.startsWith('X-'));
  const headerPrefix = hasPrefixes ? '' : 'X-';
  let headers = {};
  for (const [name, value] of headerPairs) {
    const fullName = `${headerPrefix}${name}`;
    if (Array.isArray(value)) {
      headers[fullName] = value.map((val) => `${val}`);
    } else {
      headers[fullName] = [`${value}`];
    }
  }
  return headers;
}

export const stripEmpty = (data: object) => {
  const filtered = Object.entries(data).filter(([key, value]) => value !== '');
  return filtered.reduce((previous, [key, value]) => {
    return {
      ...previous,
      [key]: value,
    };
  }, {});
};

export function delay(durationMillis: number, block: () => void): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      block();
      resolve();
    }, durationMillis);
  });
}
