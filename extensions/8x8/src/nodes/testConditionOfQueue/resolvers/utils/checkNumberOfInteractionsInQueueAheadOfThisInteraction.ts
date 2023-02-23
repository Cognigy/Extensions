import type { TestConditionOfQueueValues } from '../../types';
import checkIfValueIsGreaterThan from './checkIfValueIsGreaterThan';

const checkNumberOfInteractionsInQueueAheadOfThisInteraction = (options: TestConditionOfQueueValues, queueStatistics: { 'queue-size': number }): boolean => {
  const { numberOfInteractionsInQueueAheadOfThisInteractionValue } = options;
  const queueSize = queueStatistics['queue-size'];
  return checkIfValueIsGreaterThan(queueSize, numberOfInteractionsInQueueAheadOfThisInteractionValue);
};

export default checkNumberOfInteractionsInQueueAheadOfThisInteraction;
