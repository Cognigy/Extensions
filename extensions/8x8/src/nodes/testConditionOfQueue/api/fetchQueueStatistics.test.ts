import axios from 'axios';
import fetchQueueStatistics from './fetchQueueStatistics';

const mockAxios = axios as unknown as jest.Mock;
jest.mock('axios', () => jest.fn());

describe('test condition of queue > testConditionOfQueueNodeResolver', () => {
  const mockParams = {
    queueId: '123',
    clusterBaseUrl: 'https://clusterBaseUrl',
    tenantId: 'tenantId',
    dataRequestToken: 'dataRequestToken'
  };

  it('should return null if no data comes', async() => {
    mockAxios.mockResolvedValue({ data: null });
    const result = await fetchQueueStatistics(mockParams);
    expect(result).toEqual(null);
  });

  it('should return queue statisctis', async() => {
    const mockData = {
      a: 1
    };
    mockAxios.mockResolvedValue({
      data: {
        queue: mockData
      }
    });
    const result = await fetchQueueStatistics(mockParams);
    expect(result).toEqual(mockData);
  });

  it('should throw error fetchQueueStatistics', async() => {
    const error = new Error('error');
    mockAxios.mockRejectedValueOnce(error);
    await expect(fetchQueueStatistics(mockParams)).rejects.toThrow(error);
  });
});
