import checkTheInstantaneousWaitTimeForThisQueueIsGreaterThan from './checkTheInstantaneousWaitTimeForThisQueueIsGreaterThan';

describe('testConditionOfQueue > checkTheInstantaneousWaitTimeForThisQueueIsGreaterThan', () => {
  it('should return true if thirtyMinAvgWaitTime is greater than theInstantaneousExpectedWaitTimeCalculationExceedsValueInSeconds', () => {
    expect(checkTheInstantaneousWaitTimeForThisQueueIsGreaterThan({
      theInstantaneousExpectedWaitTimeCalculationExceedsValueInSeconds: 0
    }, { 'thirty-min-avg-wait-time': 1 })).toBe(true);
  });

  it('should return false if thirtyMinAvgWaitTime is less than theInstantaneousExpectedWaitTimeCalculationExceedsValueInSeconds', () => {
    expect(checkTheInstantaneousWaitTimeForThisQueueIsGreaterThan({
      theInstantaneousExpectedWaitTimeCalculationExceedsValueInSeconds: 1
    }, { 'thirty-min-avg-wait-time': 0 })).toBe(false);
  });
});
