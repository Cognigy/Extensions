/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IResolverParams } from '@cognigy/extension-tools';
import type { IOptionsResolverReturnData } from '@cognigy/extension-tools/build/interfaces/descriptor';
import type { I8x8ScheduleNameResponse, Schedule } from '../types';
import type { I8x8SimpleConnection } from '../../../connections/8x8SimpleConnection';

export type IGetScheduleDropdownOptionsParams = IResolverParams & {
  config: {
    connection: I8x8SimpleConnection
  }
};

const getScheduleDropdownOptions = async({ api, config }: IGetScheduleDropdownOptionsParams): Promise<IOptionsResolverReturnData[]> => {
  try {
    const { apiKey, tenantId, clusterBaseUrl } = config.connection;

    const result = await api.httpRequest!({
      method: 'GET',
      url: `${clusterBaseUrl}/cc/v1/schedules`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-8x8-Tenant': tenantId,
        'x-api-key': apiKey
      }
    });
    const schedules = (result.data as I8x8ScheduleNameResponse)?.schedules?.schedule ?? [];

    return schedules.map((schedule: Schedule) => {
      return {
        label: schedule.name,
        value: schedule.id.toString()
      };
    });
  } catch (error) {
    throw new Error(error);
  }
};

export default getScheduleDropdownOptions;
