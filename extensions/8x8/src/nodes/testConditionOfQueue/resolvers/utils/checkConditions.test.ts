import type { TestConditionOfQueueResolverParams } from '../../types';
import { ThereAreNoAgentsValueOption } from '../../types';
import getMockQueueStatisticsResponse from '../../__mocks__/getMockQueueStatisticsResponse';
import checkConditions from './checkConditions';

describe('test condition of queue > checkCondition', () => {
  const mockQueueStatistics = getMockQueueStatisticsResponse();
  const mockOptions = {
    thereAreNoAgentsToggle: true,
    numberOfInteractionsInQueueAheadOfThisInteractionToggle: true,
    thereAreNoAgentsValue: ThereAreNoAgentsValueOption.Available,
    numberOfInteractionsInQueueAheadOfThisInteractionValue: 1
  } as unknown as TestConditionOfQueueResolverParams['config'];

  it('should return true if all conditions are true', () => {
    const result = checkConditions(mockOptions, mockQueueStatistics);
    expect(result).toBe(true);
  });

  it('should return false if all conditions are false', () => {
    const result = checkConditions(mockOptions, {
      ...mockQueueStatistics,
      'agent-count-waitTransact': 1,
      'queue-size': 0
    });
    expect(result).toBe(false);
  });

  it('should return true if one condition is false', () => {
    const result = checkConditions(mockOptions, {
      ...mockQueueStatistics,
      'agent-count-waitTransact': 1,
      'queue-size': 2
    });
    expect(result).toBe(true);
  });
});
