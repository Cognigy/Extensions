import type { TestConditionOfQueueValues } from '../../types';
import checkIfValueIsGreaterThan from './checkIfValueIsGreaterThan';

const checkThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThan = (options: TestConditionOfQueueValues, queueStatistics: {
  'longest-wait-time': number
}): boolean => {
  const { thereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanValueInSeconds } = options;
  const longestWaitTime = queueStatistics['longest-wait-time'];

  return checkIfValueIsGreaterThan(longestWaitTime, thereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanValueInSeconds);
};

export default checkThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThan;
