import type { IGetScheduleDropdownOptionsParams } from './getScheduleDropdownOptions';
import getScheduleDropdownOptions from './getScheduleDropdownOptions';

describe('getScheduleDropdownOptions', () => {
  const api = {
    httpRequest: jest.fn()
  };
  const mockSchedule = {
    id: 'mockId',
    name: 'mockName'
  };
  const mockResult = {
    data: {
      schedules: {
        schedule: [mockSchedule]
      }
    }
  };
  const getMockParams = (): IGetScheduleDropdownOptionsParams => {
    const config = {
      connection: {
        tenantId: 'mockTenantId',
        dataRequestToken: '',
        clusterBaseUrl: 'mockClusterBaseUrl'
      }
    };
    return {
      api,
      config
    } as unknown as IGetScheduleDropdownOptionsParams;
  };

  it('should return the schedule dropdown options', async() => {
    api.httpRequest.mockResolvedValue(mockResult);
    const result = await getScheduleDropdownOptions(getMockParams());
    expect(result).toEqual([{
      label: mockSchedule.name,
      value: mockSchedule.id
    }]);
  });

  it('should return empty array if data is empty object', async() => {
    api.httpRequest.mockResolvedValue({ data: {} });
    const result = await getScheduleDropdownOptions(getMockParams());
    expect(result).toEqual([]);
  });

  it('should return empty array if response is empty object', async() => {
    api.httpRequest.mockResolvedValue({ });
    const result = await getScheduleDropdownOptions(getMockParams());
    expect(result).toEqual([]);
  });

  it('should throw an error', async() => {
    const mockError = new Error('mockError');
    api.httpRequest.mockRejectedValue(mockError);
    await expect(getScheduleDropdownOptions(getMockParams())).rejects.toThrow(mockError.message);
  });
});
