import type { INodeFunctionBaseParams, IResolverParams } from '@cognigy/extension-tools';
import type { I8x8SimpleConnection } from '../../connections/8x8SimpleConnection';

export enum ThereAreNoAgentsValueOption {
  Available = 'Available',
  AvailableorBusy = 'AvailableorBusy',
  AvailableBusyOrWorkingOffline = 'AvailableBusyOrWorkingOffline',
  AvailableBusyWorkingOfflineOrOnBreak = 'AvailableBusyWorkingOfflineOrOnBreak',
  LoggedIn = 'LoggedIn',
}

export enum TestConditionOfQueueConditionToggle {
  ThereAreNoAgentsToggle = 'thereAreNoAgentsToggle',
  NumberOfInteractionsInQueueAheadOfThisInteractionToggle = 'numberOfInteractionsInQueueAheadOfThisInteractionToggle',
  ThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanToggle = 'thereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanToggle',
  TheInstantaneousExpectedWaitTimeCalculationExceedsToggle = 'theInstantaneousExpectedWaitTimeCalculationExceedsToggle',
}
export enum TestConditionOfQueueConditionValue {
  ThereAreNoAgentsValue = 'thereAreNoAgentsValue',
  NumberOfInteractionsInQueueAheadOfThisInteractionValue = 'numberOfInteractionsInQueueAheadOfThisInteractionValue',
  ThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanValueInSeconds = 'thereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanValueInSeconds',
  TheInstantaneousExpectedWaitTimeCalculationExceedsValueInSeconds = 'theInstantaneousExpectedWaitTimeCalculationExceedsValueInSeconds',
}

type TestConditionOfQueueToggles = {
  [key in TestConditionOfQueueConditionToggle]?: boolean;
};

export interface TestConditionOfQueueValues {
  [TestConditionOfQueueConditionValue.NumberOfInteractionsInQueueAheadOfThisInteractionValue]?: number
  [TestConditionOfQueueConditionValue.TheInstantaneousExpectedWaitTimeCalculationExceedsValueInSeconds]?: number
  [TestConditionOfQueueConditionValue.ThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanValueInSeconds]?: number
  [TestConditionOfQueueConditionValue.ThereAreNoAgentsValue]?: ThereAreNoAgentsValueOption
}

export interface TestConditionOfQueueResolverParams extends INodeFunctionBaseParams {
  config: {
    connection: I8x8SimpleConnection
    selectQueueId: string
  } & TestConditionOfQueueToggles & TestConditionOfQueueValues
}
export interface DropdownOption {
  value: string
  label: string
}

export enum QueueType {
  Chat = 'chat',
  Phone = 'phone',
  Email = 'email',
  Vmail = 'vmail'
}
export interface QueueApiResponse {
  'queue-id': number
  'queue-name': string
  'media-type': QueueType
}

export type GetQueueDropdownOptionsParams = IResolverParams & {
  config: {
    connection: I8x8SimpleConnection
  }
};

export interface QueueStatisticsApiResponse {
  'agent-count-busy': number
  'agent-count-loggedOut': number
  'agent-count-onBreak': number
  'agent-count-postProcess': number
  'agent-count-waitTransact': number
  'agent-count-workOffline': number
  'day-abandoned': number
  'day-accepted': number
  'day-avg-duration': number
  'day-avg-wait-time': number
  'day-queued': number
  'day-sla-activity': number
  'assigned-agent-count': number
  'enabled-agent-count': number
  'longest-wait-time': number
  'media-type': 'chat'
  'number-in-offered': number
  'number-in-progress': number
  'queue-id': number
  'queue-name': string
  'queue-size': number
  'queue-type': string
  'sla-activity': number
  'sla-target': number
  'thirty-min-abandoned': number
  'thirty-min-accepted': number
  'thirty-min-avg-duration': number
  'thirty-min-avg-wait-time': number
  'thirty-min-longest-wait-time': number
  'thirty-min-queued': number
  'thirty-min-sla-activity': number
}

export type CheckConditionFn = (conditionOptions: TestConditionOfQueueResolverParams['config'], queueStatistics: QueueStatisticsApiResponse) => boolean;
