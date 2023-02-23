import type { TestConditionOfQueueValues } from '../../types';
import checkIfValueIsGreaterThan from './checkIfValueIsGreaterThan';

const checkTheInstantaneousWaitTimeForThisQueueIsGreaterThan = (options: TestConditionOfQueueValues, queueStatistics: { 'thirty-min-avg-wait-time': number }): boolean => {
  const { theInstantaneousExpectedWaitTimeCalculationExceedsValueInSeconds } = options;
  const thirtyMinAvgWaitTime = queueStatistics['thirty-min-avg-wait-time'];

  return checkIfValueIsGreaterThan(thirtyMinAvgWaitTime, theInstantaneousExpectedWaitTimeCalculationExceedsValueInSeconds);
};

export default checkTheInstantaneousWaitTimeForThisQueueIsGreaterThan;
