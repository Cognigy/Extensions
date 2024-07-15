import {
  INodeExecutionAPI,
  INodeField,
} from "@cognigy/extension-tools/build/interfaces/descriptor";

type Inputs = { [s: string]: any };

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

export function normalizeTextArray(texts: Array<string | undefined> | string | undefined | null): Array<string> | undefined {
  if (typeof texts === 'string') {
    return [normalizeText(texts)];
  }
  if (!Array.isArray(texts) || texts.length === 0) {
    return undefined;
  }

  if (texts.length === 1 && !normalizeText(texts[0])) {
    return undefined;
  }

  const output: Array<string> = [];
  for (let text of texts) {
    const normalized = normalizeText(text);
    if (normalized) {
      output.push(normalized);
    }
  }
  return output;
}

export function normalizedBoolean(field: INodeField, config: Inputs): boolean {
  const value = config[field.key]
  if (value === true) {
    return true;
  }
  if (value === false) {
    return false;
  }
  if (typeof field.defaultValue === 'boolean') {
    return field.defaultValue
  }
  return false;
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

export function playInBackgroundToMode(playInBackground: boolean): string {
  return playInBackground ? "BACKGROUND" :"FOREGROUND"
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

export function getStringListFromContext(api: INodeExecutionAPI, key: string): Array<string> {
  const output: Array<string> = [];
  const contextValue = api.getContext(key);
  if (Array.isArray(contextValue)) {
    for (let string of contextValue) {
      if (typeof string === 'string') {
        output.push(string);
      } else {
        api.log('error', `Discarded a value from the context key ${key}: ${string}`);
      }
    }
  } else {
    api.log('error', `Context key ${key} did not contain an array!`);
  }
  return output
}
