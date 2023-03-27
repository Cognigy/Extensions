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
    speakers: Speaker | 'BOTH',
  };
}

const defaultSpeaker = 'BOTH';

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
      defaultValue: defaultSpeaker,
      params: {
        required: true,
        options: [
          { value: defaultSpeaker, label: t.recordingStart.inputSpeakersBothLabel },
          { value: 'CUSTOMER', label: t.recordingStart.inputSpeakersCustomerLabel },
          { value: 'AGENT', label: t.recordingStart.inputSpeakersAgentLabel },
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

    let speakers: Array<Speaker>;
    switch (config.speakers ?? defaultSpeaker) {
      case 'CUSTOMER':
        speakers = ['CUSTOMER'];
        break;
      case 'AGENT':
        speakers = ['AGENT'];
        break;
      default:
        speakers = ['CUSTOMER', 'AGENT'];
        break;
    }

    const payload = {
      status: 'recording-start',
      maxDuration: convertDuration(config.maxDuration),
      recordingId: normalizeText(config.recordingId),
      speakers: speakers,
    };
    api.say('', payload);
  },
});
