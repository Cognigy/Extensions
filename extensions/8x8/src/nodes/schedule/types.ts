import type { INodeFunctionBaseParams } from '@cognigy/extension-tools';
import type { I8x8Connection } from '../../connections/8x8Connection';
import type StoreLocationName from '../../constants/StoreLocationName';

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
    connection: I8x8Connection
    scheduleNameToID: string
    storeLocation: StoreLocationName
    contextKey?: string
    inputKey?: string
  }
}
