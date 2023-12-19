import { QueueType } from '../types';
import type { DropdownOption, GetQueueDropdownOptionsParams, QueueApiResponse } from '../types';
import getQueueDropdownOptions from './getQueueDropdownOptions';

describe('getQueueDropdownOptions', () => {
  const api = {
    httpRequest: jest.fn()
  };
  const getMockQueue = (id: number, type = QueueType.Chat): QueueApiResponse => ({
    'queue-id': id,
    'queue-name': `mock name ${id}`,
    'media-type': type
  });
  const getDisplayType = (type: QueueType): string => {
    switch (type) {
      case QueueType.Chat:
        return 'Chat';
      case QueueType.Phone:
        return 'Phone';
      case QueueType.Email:
        return 'Email';
      case QueueType.Vmail:
        return 'Vmail';
      default:
        return 'Unknown';
    }
  };
  const convertToDropdownOption = (queue: QueueApiResponse): DropdownOption => ({
    label: `${getDisplayType(queue['media-type'])}: ${queue['queue-name']}`,
    value: queue['queue-id'].toString()
  });

  const getMockParams = (): GetQueueDropdownOptionsParams => {
    const config = {
      connection: {
        tenantId: 'mockTenantId',
        apiKey: 'dfasf34afsef34f4',
        baseUrl: 'mockBaseUrl'
      }
    };
    return {
      api,
      config
    } as unknown as GetQueueDropdownOptionsParams;
  };

  it('should return the queue dropdown options', async() => {
    const mockQueue1 = getMockQueue(1);
    api.httpRequest.mockResolvedValue({
      data: {
        queue: [mockQueue1]
      }
    });
    const result = await getQueueDropdownOptions(getMockParams());
    expect(result).toEqual([convertToDropdownOption(mockQueue1)]);
  });

  it('should return the queue dropdown options', async() => {
    const mockQueue1 = getMockQueue(1);
    const mockQueue2 = getMockQueue(2, QueueType.Phone);
    const mockQueue3 = getMockQueue(3, QueueType.Email);
    const mockQueue4 = getMockQueue(4, QueueType.Vmail);
    const mockQueue5 = getMockQueue(5, 'test' as QueueType.Vmail);
    api.httpRequest.mockResolvedValue({
      data: {
        queue: [mockQueue1, mockQueue2, mockQueue3, mockQueue4, mockQueue5]
      }
    });
    const expected = [
      convertToDropdownOption(mockQueue1),
      convertToDropdownOption(mockQueue2),
      convertToDropdownOption(mockQueue3),
      convertToDropdownOption(mockQueue4),
      convertToDropdownOption(mockQueue5)
    ];
    const result = await getQueueDropdownOptions(getMockParams());
    expect(result).toEqual(expected);
  });

  it('should return empty array if data is empty object', async() => {
    api.httpRequest.mockResolvedValue({});
    await expect(getQueueDropdownOptions(getMockParams())).rejects.toThrow('No queues found');
  });
  it('should return empty array if result is empty object', async() => {
    api.httpRequest.mockResolvedValue({});
    await expect(getQueueDropdownOptions(getMockParams())).rejects.toThrow('No queues found');
  });

  it('should throw an error if api throw eror', async() => {
    const mockError = new Error('mockError');
    api.httpRequest.mockRejectedValue(mockError);
    await expect(getQueueDropdownOptions(getMockParams())).rejects.toThrow(mockError.message);
  });
});

