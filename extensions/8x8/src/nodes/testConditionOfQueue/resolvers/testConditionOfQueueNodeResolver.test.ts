import fetchQueueStatistics from '../api/fetchQueueStatistics';
import type { TestConditionOfQueueResolverParams } from '../types';
import testConditionOfQueueNodeResolver from './testConditionOfQueueNodeResolver';
import checkConditions from './utils/checkConditions';

jest.mock('../api/fetchQueueStatistics', () => jest.fn());
jest.mock('./utils/checkConditions', () => jest.fn().mockReturnValue(true));

const mockFetchQueueStatistics = fetchQueueStatistics as jest.Mock;
const mockCheckConditions = checkConditions as jest.Mock;

describe('test condition of queue > testConditionOfQueueNodeResolver', () => {
  const onConditionMatchedChild = {
    id: 'onConditionMatchedChild',
    type: 'onConditionMatched'
  };
  const onConditionNotMatchedChild = {
    id: 'onConditionNotMatchedChild',
    type: 'onConditionNotMatched'
  };
  const api = {
    setNextNode: jest.fn(),
    log: jest.fn()
  };
  const mockQueueId = '123';
  const mockConfig = {
    connection: {
      baseUrl: 'https://baseUrl',
      tenantId: 'tenantId',
      dataRequestToken: 'dataRequestToken'
    },
    selectQueueId: mockQueueId
  } as unknown as TestConditionOfQueueResolverParams['config'];
  const cognigy = {
    api
  };

  const getMockParams = (overrides?: Partial<TestConditionOfQueueResolverParams>): TestConditionOfQueueResolverParams => ({
    cognigy,
    config: mockConfig,
    childConfigs: [
      onConditionMatchedChild,
      onConditionNotMatchedChild
    ],
    ...overrides
  } as unknown as TestConditionOfQueueResolverParams);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should matche the condition', async() => {
    const mockQueueStatisticsData = {
      queueId: mockQueueId,
      queueName: 'queueName'
    };
    mockFetchQueueStatistics.mockResolvedValue(mockQueueStatisticsData);
    mockCheckConditions.mockReturnValue(true);

    await testConditionOfQueueNodeResolver(getMockParams());
    expect(mockCheckConditions).toHaveBeenCalledWith(mockConfig, mockQueueStatisticsData);
    expect(api.setNextNode).toHaveBeenCalledWith(onConditionMatchedChild.id);
  });

  it('should not matche the condition', async() => {
    const mockQueueStatisticsData = {
      queueId: mockQueueId,
      queueName: 'queueName'
    };
    mockFetchQueueStatistics.mockResolvedValue(mockQueueStatisticsData);
    mockCheckConditions.mockReturnValue(false);

    await testConditionOfQueueNodeResolver(getMockParams());
    expect(mockCheckConditions).toHaveBeenCalledWith(mockConfig, mockQueueStatisticsData);
    expect(api.setNextNode).toHaveBeenCalledWith(onConditionNotMatchedChild.id);
  });

  it('should throw error if no queue id is selected', async() => {
    await testConditionOfQueueNodeResolver(getMockParams({
      config: {
        ...mockConfig,
        selectQueueId: null as unknown as string
      }
    }));
    expect(api.log).toHaveBeenCalledWith('error', 'No queue ID selected');
    expect(api.setNextNode).toHaveBeenCalledWith(onConditionNotMatchedChild.id);
  });

  it('should throw error if no queue statistics data is found', async() => {
    mockFetchQueueStatistics.mockResolvedValue(null);
    await testConditionOfQueueNodeResolver(getMockParams());
    expect(api.log).toHaveBeenCalledWith('error', `No queue statistics data found for queue id ${mockQueueId}`);
    expect(api.setNextNode).toHaveBeenCalledWith(onConditionNotMatchedChild.id);
  });

  it('should throw network error', async() => {
    const error = new Error('error');
    mockFetchQueueStatistics.mockRejectedValueOnce(error);
    await testConditionOfQueueNodeResolver(getMockParams());
    expect(api.setNextNode).toHaveBeenCalledWith(onConditionNotMatchedChild.id);
    expect(api.log).toHaveBeenCalledWith('error', error.message);
  });
});
