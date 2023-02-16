import type { CheckConditionFn, QueueStatisticsApiResponse, TestConditionOfQueueResolverParams } from '../../types';
import { TestConditionOfQueueConditionToggle } from '../../types';
import checkNumberOfInteractionsInQueueAheadOfThisInteraction from './checkNumberOfInteractionsInQueueAheadOfThisInteraction';
import checkTheInstantaneousWaitTimeForThisQueueIsGreaterThan from './checkTheInstantaneousWaitTimeForThisQueueIsGreaterThan';
import checkThereAreNoAgents from './checkThereAreNoAgents';
import checkThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThan from './checkThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThan';

const conditions: { [key in TestConditionOfQueueConditionToggle]: CheckConditionFn } = {
  [TestConditionOfQueueConditionToggle.ThereAreNoAgentsToggle]: checkThereAreNoAgents,
  [TestConditionOfQueueConditionToggle.NumberOfInteractionsInQueueAheadOfThisInteractionToggle]: checkNumberOfInteractionsInQueueAheadOfThisInteraction,
  [TestConditionOfQueueConditionToggle.ThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanToggle]: checkThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThan,
  [TestConditionOfQueueConditionToggle.TheInstantaneousExpectedWaitTimeCalculationExceedsToggle]: checkTheInstantaneousWaitTimeForThisQueueIsGreaterThan
};

const checkConditions: CheckConditionFn = (config: TestConditionOfQueueResolverParams['config'], queueStatistics: QueueStatisticsApiResponse): boolean => {
  const conditionFields = Object.values(TestConditionOfQueueConditionToggle).filter(field => Boolean(config[field]));
  return conditionFields.some(field => conditions[field](config, queueStatistics));
};

export default checkConditions;
