/* eslint-disable no-undefined */
const checkIfValueIsGreaterThan = (actual?: number | null, expectedLimit?: number | null): boolean => {
  if (actual === undefined || actual === null || actual < 0) return false;
  if (expectedLimit === undefined || expectedLimit === null || expectedLimit < 0) return false;

  return actual > expectedLimit;
};

export default checkIfValueIsGreaterThan;
