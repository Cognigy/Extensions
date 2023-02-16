/* eslint-disable no-undefined */
import checkIfValueIsGreaterThan from './checkIfValueIsGreaterThan';

describe('testConditionOfQueue > checkIfValueIsGreaterThan', () => {
  it('should return true if actual is greater than expectedLimit', () => {
    expect(checkIfValueIsGreaterThan(5, 4)).toBe(true);
  });

  it('should return false if actual is less than expectedLimit', () => {
    expect(checkIfValueIsGreaterThan(4, 5)).toBe(false);
  });

  it('should return false if actual is undefined', () => {
    expect(checkIfValueIsGreaterThan(undefined, 5)).toBe(false);
  });

  it('should return false if actual is 0', () => {
    expect(checkIfValueIsGreaterThan(0, 5)).toBe(false);
  });

  it('should return false if expectedLimit is undefined', () => {
    expect(checkIfValueIsGreaterThan(5, undefined)).toBe(false);
  });

  it('should return true if expectedLimit is 0', () => {
    expect(checkIfValueIsGreaterThan(5, 0)).toBe(true);
  });

  it('should return false if actual is null', () => {
    expect(checkIfValueIsGreaterThan(null, 5)).toBe(false);
  });
  it('should return false if expectedLimit is null', () => {
    expect(checkIfValueIsGreaterThan(5, null)).toBe(false);
  });
});
