import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { stripEmpty } from '../helpers/stripEmpty';

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
  defaultLabel: 'Start Recording',
  summary: 'Start or resume recording of a call',
  appearance: {
    color: '#e95ba7',
  },
  tags: ['basic', 'service'],
  fields: [
    {
      type: 'number',
      key: 'maxDuration',
      label: 'Maximum Recording Duration (s)',
      description: 'After maximum recording duration (in seconds), the recording will be stopped automatically.',
      params: {
        placeholder: 'Value in seconds (e.g. 60)',
      }
    },
    {
      type: 'text',
      key: 'recordingId',
      label: 'Recording ID',
      description: 'An arbitrary string to identify the recording in case multiple recordings are created in the same dialog',
    },
    {
      type: 'select',
      key: 'speakers',
      label: 'Speakers to record',
      params: {
        options: [
          { value: null, label: 'Both Lines' },
          { value: 'CUSTOMER', label: 'Customer' },
          { value: 'AGENT', label: 'Agent' }
        ]
      }
    }
  ],
  sections: [
    {
      key: 'additional',
      label: 'Additional Settings',
      fields: ['maxDuration', 'recordingId', 'speakers'],
      defaultCollapsed: true
    }
  ],
  form: [
    {
      key: 'additional',
      type: 'section',
    }
  ],
  function: async ({ cognigy, config}: IRecordingStartParams) => {
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
  }
});
