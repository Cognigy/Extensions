import axios from 'axios';

interface I8x8ScheduleResponse {
  'schedule-status': { status: number | string }
}

export interface FetchCustomerDataParams {
  apiKey: string
  tenantId: string
  url: string
  scheduleID: string
}

const fetchScheduleData = async(apiKey: string, tenantId: string, url: string, scheduleID: string): Promise<I8x8ScheduleResponse> => {
  const scheduleResponse = await axios({
    method: 'GET',
    url: `${url}/cc/v1/schedules/${scheduleID}/status`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-8x8-Tenant': tenantId,
      'x-api-key': apiKey
    }
  });

  return scheduleResponse.data;
};

export default fetchScheduleData;
