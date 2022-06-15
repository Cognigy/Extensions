import { INodeFieldTranslations } from '@cognigy/extension-tools/build/interfaces/descriptor';
import en from '../translations/en_US.json';
import de from '../translations/de_DE.json';
// There are no french translations for cognigy yet
// import fr from '../translations/fr_FR.json';

// This is from the official react-i18n package:
type KeysWithSeparator<K1, K2> = `${K1 & string}.${K2 & string}`;
type KeysWithSeparator2<K1, K2> = KeysWithSeparator<K1, Exclude<K2, keyof any[]>>;

type Normalize2<T, K = keyof T> = K extends keyof T
  ? T[K] extends Record<string, any>
    ? T[K] extends readonly any[]
      ?
        | KeysWithSeparator2<K, Normalize2<T[K]>>
        | KeysWithSeparator2<K, keyof T[K]>
      :
        | KeysWithSeparator<K, Normalize2<T[K]>>
        | KeysWithSeparator<K, keyof T[K]>
    : never
  : never;

type Normalize<T> = keyof T | Normalize2<T>;

type TranslationType = Normalize<typeof en>;

const getTranslation = <T extends typeof en>(translationData: T, keys: Array<string>, fallback: T): string => {
  let copiedKeys = [...keys];
  let currentKey = copiedKeys.shift();
  let result = translationData[currentKey];
  let fallbackResult = fallback[currentKey];
  while(copiedKeys.length) {
    currentKey = copiedKeys.shift();
    result = result[currentKey];
    fallbackResult = fallbackResult[currentKey];
  }
  if (typeof result === 'string') {
    return result.substring(0, 256);
  }

  return fallbackResult?.substr(0, 256) as string | undefined ?? `Key not found: ${keys.join('.')}`;
}

const t = (key: TranslationType): INodeFieldTranslations => {
  const splits = key.split('.');
  const defaultTranslation = getTranslation(en, splits, en);
  return {
    default: defaultTranslation,
    deDE: getTranslation(de, splits, en),
    enUS: defaultTranslation,
  };
};

export { t };