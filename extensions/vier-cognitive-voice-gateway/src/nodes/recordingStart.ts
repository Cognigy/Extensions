import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import {
  convertDuration,
  normalizeText,
} from '../helpers/util';
import t from '../translations';

type Speaker = 'CUSTOMER' | 'AGENT';

export interface IRecordingStartParams extends INodeFunctionBaseParams {
  config: {
    maxDuration?: number,
    recordingId?: string,
    speakers?: Speaker | null,
  };
}

export const recordingStartNode = createNodeDescriptor({
  type: 'recordingStart',
  defaultLabel: t.recordingStart.nodeLabel,
  summary: t.recordingStart.nodeSummary,
  appearance: {
    color: '#e95ba7',
  },
  tags: ['basic', 'service'],
  fields: [
    {
      type: 'number',
      key: 'maxDuration',
      label: t.recordingStart.inputMaxDurationLabel,
      description: t.recordingStart.inputMaxDurationDescription,
      params: {
        placeholder: 'Value in seconds (e.g. 60)',
      },
    },
    {
      type: 'text',
      key: 'recordingId',
      label: t.shared.inputRecordingIdLabel,
      description: t.shared.inputRecordingIdDescription,
    },
    {
      type: 'select',
      key: 'speakers',
      label: t.recordingStart.inputSpeakersLabel,
      params: {
        options: [
          { value: null, label: 'Both Lines' },
          { value: 'CUSTOMER', label: 'Customer' },
          { value: 'AGENT', label: 'Agent' },
        ],
      },
    },
  ],
  preview: {
    type: 'text',
    key: 'recordingId',
  },
  function: async ({ cognigy, config }: IRecordingStartParams) => {
    const { api } = cognigy;

    const speakers: Array<Speaker> = config.speakers ? [config.speakers] : ['CUSTOMER', 'AGENT'];

    const payload = {
      status: 'recording-start',
      maxDuration: convertDuration(config.maxDuration),
      recordingId: normalizeText(config.recordingId),
      speakers: speakers,
    };
    api.say('', payload);
  },
});
