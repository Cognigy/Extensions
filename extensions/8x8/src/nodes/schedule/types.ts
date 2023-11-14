import type { INodeFunctionBaseParams } from '@cognigy/extension-tools';
import type StoreLocationName from '../../constants/StoreLocationName';
import type { I8x8SimpleConnection } from '../../connections/8x8SimpleConnection';

export interface ScheduleDay {
  day: number
  properties: {
    status: number
    'start-time': string
    'end-time': string
  }
}
export interface Schedule {
  id: number
  name: string
  'week-days': {
    'week-day': ScheduleDay[]
  }
}
export interface I8x8ScheduleNameResponse {
  schedules?: {
    schedule?: Schedule[]
  }
}

export interface IGetScheduleParams extends INodeFunctionBaseParams {
  config: {
    connection: I8x8SimpleConnection
    scheduleNameToID: string
    storeLocation: StoreLocationName
    contextKey?: string
    inputKey?: string
  }
}
