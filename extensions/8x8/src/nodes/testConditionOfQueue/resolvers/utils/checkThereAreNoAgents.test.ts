import { ThereAreNoAgentsValueOption } from '../../types';
import getQueueStatisticsResponse from '../../__mocks__/getMockQueueStatisticsResponse';
import checkThereAreNoAgents from './checkThereAreNoAgents';

describe('testConditionOfQueue > checkThereAreNoAgents', () => {
  const mockQueueStatisticsData = getQueueStatisticsResponse();

  it('should return true if there are no agents available', () => {
    expect(checkThereAreNoAgents({
      thereAreNoAgentsValue: ThereAreNoAgentsValueOption.Available
    }, { ...mockQueueStatisticsData, 'agent-count-waitTransact': 0 })).toBe(true);
  });

  it('should return false if there are agents available', () => {
    expect(checkThereAreNoAgents({
      thereAreNoAgentsValue: ThereAreNoAgentsValueOption.Available
    }, { ...mockQueueStatisticsData, 'agent-count-waitTransact': 1 })).toBe(false);
  });

  it('should return true if there are no agents available or onBusy', () => {
    expect(checkThereAreNoAgents({
      thereAreNoAgentsValue: ThereAreNoAgentsValueOption.AvailableorBusy
    }, { ...mockQueueStatisticsData, 'agent-count-busy': 0, 'agent-count-waitTransact': 0 })).toBe(true);
  });

  it('should return false if there are agents available or onBusy', () => {
    expect(checkThereAreNoAgents({
      thereAreNoAgentsValue: ThereAreNoAgentsValueOption.AvailableorBusy
    }, { ...mockQueueStatisticsData, 'agent-count-busy': 1, 'agent-count-waitTransact': 1 })).toBe(false);
  });

  it('should return true if there are no agents available or onBusy or WorkingOffline', () => {
    expect(checkThereAreNoAgents({
      thereAreNoAgentsValue: ThereAreNoAgentsValueOption.AvailableBusyOrWorkingOffline
    }, { ...mockQueueStatisticsData, 'agent-count-busy': 0, 'agent-count-waitTransact': 0, 'agent-count-workOffline': 0 })).toBe(true);
  });

  it('should return false if there are agents available or onBusy or WorkingOffline', () => {
    expect(checkThereAreNoAgents({
      thereAreNoAgentsValue: ThereAreNoAgentsValueOption.AvailableBusyOrWorkingOffline
    }, { ...mockQueueStatisticsData, 'agent-count-busy': 1, 'agent-count-waitTransact': 1, 'agent-count-workOffline': 1 })).toBe(false);
  });

  it('should return true if there are no agents available or onBusy or WorkingOffline or onBreak', () => {
    expect(checkThereAreNoAgents({
      thereAreNoAgentsValue: ThereAreNoAgentsValueOption.AvailableBusyWorkingOfflineOrOnBreak
    }, { ...mockQueueStatisticsData, 'agent-count-busy': 0, 'agent-count-waitTransact': 0, 'agent-count-workOffline': 0, 'agent-count-onBreak': 0 })).toBe(true);
  });

  it('should return false if there are agents available or onBusy or WorkingOffline or onBreak', () => {
    expect(checkThereAreNoAgents({
      thereAreNoAgentsValue: ThereAreNoAgentsValueOption.AvailableBusyWorkingOfflineOrOnBreak
    }, { ...mockQueueStatisticsData, 'agent-count-busy': 1, 'agent-count-waitTransact': 1, 'agent-count-workOffline': 1, 'agent-count-onBreak': 1 })).toBe(false);
  });

  it('should return true if there are no agents loggedIn', () => {
    expect(checkThereAreNoAgents({
      thereAreNoAgentsValue: ThereAreNoAgentsValueOption.LoggedIn
    }, { ...mockQueueStatisticsData })).toBe(true);
  });

  it('should return false if there are agents loggedIn', () => {
    expect(checkThereAreNoAgents({
      thereAreNoAgentsValue: ThereAreNoAgentsValueOption.LoggedIn
    }, { ...mockQueueStatisticsData, 'agent-count-onBreak': 1 })).toBe(false);
  });

  it('should return false if value is not valid', () => {
    expect(checkThereAreNoAgents({
      thereAreNoAgentsValue: 'invalid' as ThereAreNoAgentsValueOption
    }, { ...mockQueueStatisticsData })).toBe(false);
  });
});
