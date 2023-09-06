import { INodeExecutionAPI } from "@cognigy/extension-tools/build/interfaces/descriptor";

export function normalizeText(text: string | undefined | null) {
  if (!text) {
    return undefined;
  }
  const trimmed = text.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed;
}

export function normalizeTextArray(texts: Array<string | undefined> | undefined | null) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return undefined;
  }

  if (texts.length === 1 && !normalizeText(texts[0])) {
    return undefined;
  }

  const output = [];
  for (let text of texts) {
    const normalized = normalizeText(text);
    if (normalized) {
      output.push(normalized);
    }
  }
  return output;
}

export function convertWhisperText(text: string | undefined | null) {
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

export function convertDurationFromSecondsToMillis(timeout: number | undefined | null): number | undefined {
  if (!timeout || timeout < 0) {
    return undefined;
  }
  return timeout * 1000;
}

export type Data = { [key: string]: string }

export function normalizeData(api: INodeExecutionAPI, dataObject: object | undefined | null): Data | undefined {
  if (!dataObject) {
    return undefined;
  }

  if (typeof dataObject === "string") {
    try {
      dataObject = JSON.parse(dataObject);
    } catch (e) {
      api.log('error', `Failed parse data as JSON: ${e}`);
      return undefined;
    }
  }
  let entries = Object.entries(dataObject);
  if (entries.length == 0) {
    return undefined;
  }

  let output: Data = {};
  for (const [key, value] of entries) {
    output[key] = typeof value === 'string' ? value : JSON.stringify(value);
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

export function normalizeUserToUserInformation(userToUserInformation: Array<string> | undefined): Array<string> | undefined {
  if (!Array.isArray(userToUserInformation)) {
    return undefined;
  }

  const information: Array<string> = []
  for (const line of userToUserInformation) {
    if (line === undefined || line === null || line === '') {
      continue;
    }
    information.push(`${line}`)
  }
  if (information.length === 0) {
    return undefined;
  }

  return information;
}

export const DEFAULT_NUMBER_VALUE = 'none';

function toNumberOrUndefined(numeric: number | string | undefined | null): number | undefined {
  if (numeric === DEFAULT_NUMBER_VALUE) {
    return undefined;
  }
  if (typeof numeric === 'string') {
    const trimmed = numeric.trim()
    if (trimmed === '') {
      return undefined
    }
    const parsedNumber = Number(trimmed);
    return isNaN(parsedNumber) ? undefined : parsedNumber;
  }
  if (typeof numeric !== 'number') {
    return undefined;
  }
  return numeric;
}

export function normalizeInteger(numeric: number | string | undefined | null, min: number | undefined, max: number | undefined): number | undefined {
  const number = toNumberOrUndefined(numeric);
  if (min !== undefined && number < min || max !== undefined && number > max) {
    return undefined;
  }
  return number;
}

export function delay(durationMillis: number, block: () => void): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      block();
      resolve();
    }, durationMillis);
  });
}
