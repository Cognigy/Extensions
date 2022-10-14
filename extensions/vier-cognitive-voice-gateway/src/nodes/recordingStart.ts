import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import { stripEmpty } from '../helpers/util';
import t from '../translations';

type Speaker = 'CUSTOMER' | 'AGENT';

export interface IRecordingStartParams extends INodeFunctionBaseParams {
  config: {
    maxDuration?: number,
    recordingId?: string,
    speakers?: Speaker | Array<Speaker>,
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
  sections: [
    {
      key: 'additional',
      label: t.forward.sectionAdditionalSettingsLabel,
      fields: ['maxDuration', 'recordingId', 'speakers'],
      defaultCollapsed: true,
    },
  ],
  form: [
    {
      key: 'additional',
      type: 'section',
    },
  ],
  function: async ({ cognigy, config }: IRecordingStartParams) => {
    const { api } = cognigy;

    // Convert to ms
    if (config.maxDuration) {
      config.maxDuration = config.maxDuration * 1000;
    }

    if (config.speakers) {
      config.speakers = [config.speakers] as Array<Speaker>;
    }

    const strippedConfig = stripEmpty(config);

    api.say('', {
      status: 'recording-start',
      ...strippedConfig,
    });
  },
});
