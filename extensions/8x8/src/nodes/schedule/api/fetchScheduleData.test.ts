import axios from 'axios';
import type { FetchCustomerDataParams } from './fetchScheduleData';
import fetchScheduleData from './fetchScheduleData';

jest.mock('axios', () => jest.fn());
const mockAxios = axios as unknown as jest.Mock;

describe('api > fetchScheduleData()', () => {
  const mockParams: FetchCustomerDataParams = {
    authToken: 'fdkjhgkj434kbgfi34b',
    url: 'https://8x8.com',
    scheduleID: '1'
  };

  const { authToken, url, scheduleID } = mockParams;

  it('should fetch and return schedule data', async() => {
    mockAxios.mockReturnValueOnce({ data: { 'schedule-status': { status: 0 } } });
    const data = await fetchScheduleData(authToken, url, scheduleID);

    expect(data).toEqual({ 'schedule-status': { status: 0 } });
  });
});
