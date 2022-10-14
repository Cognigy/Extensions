export function normalizeText(text) {
  if (!text) {
    return undefined;
  }
  const trimmed = text.trim();
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

export function convertDuration(timeout: number | undefined): number | undefined {
  if (!timeout || timeout < 0) {
    return undefined;
  }
  return timeout * 1000;
}

export type Data = { [key: string]: string }

export function normalizeData(dataObject: object | undefined): Data | undefined {
  if (!dataObject) {
    return undefined;
  }

  let entries = Object.entries(dataObject);
  if (entries.length == 0) {
    return undefined;
  }

  let output: Data = {};
  for (const [key, value] of entries) {
    output[key] = `${value}`;
  }
  return output;
}

export type CustomSipHeaders = { [name: string]: Array<string> };

export function normalizeSipHeaders(headersObject: object | undefined): CustomSipHeaders | undefined {
  if (!headersObject) {
    return undefined;
  }

  let headerPairs = Object.entries(headersObject);
  if (headerPairs.length == 0) {
    return undefined;
  }

  let hasPrefixes = headerPairs.some(([name]) => name.startsWith('X-'));
  const headerPrefix = hasPrefixes ? '' : 'X-';
  let headers: CustomSipHeaders = {};
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

export function delay(durationMillis: number, block: () => void): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      block();
      resolve();
    }, durationMillis);
  });
}
