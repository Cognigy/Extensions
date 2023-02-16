import axios from 'axios';

interface I8x8ScheduleResponse {
  'schedule-status': { status: number | string }
}

export interface FetchCustomerDataParams {
  authToken: string
  url: string
  scheduleID: string
}

const fetchScheduleData = async(authToken: string, url: string, scheduleID: string): Promise<I8x8ScheduleResponse> => {
  const scheduleResponse = await axios({
    method: 'GET',
    url: `${url}/api/provisioning/schedules/${scheduleID}/status.json`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'cache-control': 'no-cache',
      Authorization: `Basic ${Buffer.from(authToken).toString('base64')}`
    }
  });

  return scheduleResponse.data;
};

export default fetchScheduleData;
