import { createNodeDescriptor } from '@cognigy/extension-tools';
import type { INodeField, INodeFieldAndSectionFormElement } from '@cognigy/extension-tools/build/interfaces/descriptor';
import createBasicChildNode from '../../utils/createBasicChildNode';
import getQueueDropdownOptions from './resolvers/getQueueDropdownOptions';
import testConditionOfQueueNodeResolver from './resolvers/testConditionOfQueueNodeResolver';
import { TestConditionOfQueueConditionToggle, TestConditionOfQueueConditionValue, ThereAreNoAgentsValueOption } from './types';

export const onConditionMatchedNode = createBasicChildNode({
  type: 'onConditionMatched',
  parentType: 'testConditionOfQueue',
  defaultLabel: 'Condition matched'
});

export const onConditionNotMatchedNode = createBasicChildNode({
  type: 'onConditionNotMatched',
  parentType: 'testConditionOfQueue',
  defaultLabel: 'Condition not matched'
});
const createToggleField = ({ description, key, label }: {
  key: TestConditionOfQueueConditionToggle
  label: string
  description: string
}): INodeField => ({
  key,
  label,
  description,
  type: 'toggle'
});
const createInputNumberField = ({ conditionKey, description, key, label }: {
  key: TestConditionOfQueueConditionValue
  conditionKey: TestConditionOfQueueConditionToggle
  label: string
  description: string
}): INodeField => ({
  key,
  label,
  description,
  type: 'number',
  params: {
    required: true
  },
  condition: {
    key: conditionKey,
    value: true
  }
});
const inputNumberOfSecondsField = {
  label: 'Number of seconds',
  description: 'Number of seconds'
};

const conditionFields: INodeField[] = [
  createToggleField({
    key: TestConditionOfQueueConditionToggle.ThereAreNoAgentsToggle,
    label: 'There are NO agents:',
    description: 'There are NO agents: Available, busy, working offline, or on break'
  }),
  {
    key: TestConditionOfQueueConditionValue.ThereAreNoAgentsValue,
    label: 'Select option',
    description: 'Select option',
    type: 'select',
    params: {
      required: true,
      options: [
        {
          label: 'Available',
          value: ThereAreNoAgentsValueOption.Available
        },
        {
          label: 'Available or busy',
          value: ThereAreNoAgentsValueOption.AvailableorBusy
        },
        {
          label: 'Available, busy or working offline',
          value: ThereAreNoAgentsValueOption.AvailableBusyOrWorkingOffline
        },
        {
          label: 'Available, busy, working offline, or on break',
          value: ThereAreNoAgentsValueOption.AvailableBusyWorkingOfflineOrOnBreak
        },
        {
          label: 'Logged in (assigned but may not be enabled)',
          value: ThereAreNoAgentsValueOption.LoggedIn
        }
      ]
    },
    condition: {
      key: TestConditionOfQueueConditionToggle.ThereAreNoAgentsToggle,
      value: true
    }
  },
  createToggleField({
    key: TestConditionOfQueueConditionToggle.NumberOfInteractionsInQueueAheadOfThisInteractionToggle,
    label: 'The number of interactions waiting ahead of this interaction is greater than:',
    description: 'The number of interactions in queue ahead of this interaction.'
  }),
  createInputNumberField({
    key: TestConditionOfQueueConditionValue.NumberOfInteractionsInQueueAheadOfThisInteractionValue,
    conditionKey: TestConditionOfQueueConditionToggle.NumberOfInteractionsInQueueAheadOfThisInteractionToggle,
    label: 'Number of interactions',
    description: 'The number of interactions in queue ahead of this interaction'

  }),
  createToggleField({
    key: TestConditionOfQueueConditionToggle.ThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanToggle,
    label: 'There is an interaction in this queue that has been waiting longer than',
    description: 'There is an interaction in this queue that has been waiting longer than (seconds)'
  }),
  createInputNumberField({
    key: TestConditionOfQueueConditionValue.ThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanValueInSeconds,
    conditionKey: TestConditionOfQueueConditionToggle.ThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanToggle,
    ...inputNumberOfSecondsField
  }),
  createToggleField({
    key: TestConditionOfQueueConditionToggle.TheInstantaneousExpectedWaitTimeCalculationExceedsToggle,
    label: 'The instantaneous expected-wait-time* calculation exceeds',
    // eslint-disable-next-line max-len
    description: 'The "expected-wait-time" test is useful when there are more than 20 active equivalent agents. Mathematical uncertainty, with fewer than 20 active, is likely to produce unreliable results.'
  }),
  createInputNumberField({
    key: TestConditionOfQueueConditionValue.TheInstantaneousExpectedWaitTimeCalculationExceedsValueInSeconds,
    conditionKey: TestConditionOfQueueConditionToggle.TheInstantaneousExpectedWaitTimeCalculationExceedsToggle,
    ...inputNumberOfSecondsField
  })
];
export const testConditionOfQueueNode = createNodeDescriptor({
  type: 'testConditionOfQueue',
  defaultLabel: 'Test Condition of Queue',
  summary: 'Test Condition of Queue',
  fields: [
    {
      key: 'connection',
      label: '8x8 CRM Connection',
      type: 'connection',
      params: {
        connectionType: 'eightbyeight',
        required: true
      }
    },
    {
      key: 'selectQueueId',
      label: 'Select the queue',
      description: 'Select the queue',
      type: 'select',
      params: {
        required: true
      },
      optionsResolver: {
        dependencies: ['connection'],
        resolverFunction: getQueueDropdownOptions
      }
    },
    ...conditionFields
  ],
  form: [
    { type: 'field', key: 'connection' },
    { type: 'field', key: 'selectQueueId' },
    ...(conditionFields.map(({ key }) => ({ type: 'field', key })) as INodeFieldAndSectionFormElement[])
  ],
  appearance: {
    color: '#ff0050'
  },
  dependencies: {
    children: [
      onConditionMatchedNode.type,
      onConditionNotMatchedNode.type
    ]
  },
  function: testConditionOfQueueNodeResolver
});

