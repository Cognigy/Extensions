/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IResolverParams } from '@cognigy/extension-tools';
import type { IOptionsResolverReturnData } from '@cognigy/extension-tools/build/interfaces/descriptor';
import type { I8x8Connection } from '../../../connections/8x8Connection';
import type { I8x8ScheduleNameResponse, Schedule } from '../types';

export type IGetScheduleDropdownOptionsParams = IResolverParams & {
  config: {
    connection: I8x8Connection
  }
};

const getScheduleDropdownOptions = async({ api, config }: IGetScheduleDropdownOptionsParams): Promise<IOptionsResolverReturnData[]> => {
  try {
    const authToken = `${config.connection.tenantId}:${config.connection.dataRequestToken}`;

    const result = await api.httpRequest!({
      method: 'GET',
      url: `${config.connection.clusterBaseUrl}/api/provisioning/schedules`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
        Authorization: `Basic ${Buffer.from(authToken).toString('base64')}`
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
