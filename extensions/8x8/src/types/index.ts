import type { FILTER_PREFIX_KEY } from '../utils/filterPrefix';

export type SearchGenericPropType = `${typeof FILTER_PREFIX_KEY}${string}`;
export interface SearchGenericParams {
  [k: SearchGenericPropType]: string | Record<string, string> | undefined
}
