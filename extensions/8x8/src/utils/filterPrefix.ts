export const FILTER_PREFIX_KEY = 'filter$';

export const isValidFilterField = (key: string): boolean => key.includes(FILTER_PREFIX_KEY);
export const addFilterKeyPrefix = (key: string): string => `${FILTER_PREFIX_KEY}${key}`;
export const removeFilterKeyPrefix = (key: string): string => key.replace(FILTER_PREFIX_KEY, '');
