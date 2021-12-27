import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { stripEmpty } from '../helpers/stripEmpty';

export interface IRecordingStopParams extends INodeFunctionBaseParams {
  config: {
    recordingId?: string,
    terminate?: boolean
  };
}

export const recordingStopNode = createNodeDescriptor({
  type: 'recordingStop',
  defaultLabel: 'Stop Recording',
  summary: 'Pause or terminate recording of a call',
  appearance: {
    color: '#b8f66a'
  },
  tags: ['basic', 'service'],
  fields: [
    {
      type: 'text',
      key: 'recordingId',
      label: 'Recording ID',
      description: 'An arbitrary string to idetnify the the recording in case multiple recordings are created in the same dialog',
    },
    {
      type: 'checkbox',
      key: 'terminate',
      description: 'Whether the recording should be terminated, rather than just paused',
      label: 'Terminate Recording'
    },
  ],
  sections: [
    {
      key: 'additional',
      fields: ['recordingId', 'terminate'],
      label: 'Additional Settings',
      defaultCollapsed: true,
    }
  ],
  form: [
    {
      key: 'additional',
      type: 'section',
    }
  ],
  function: async ({ cognigy, config }: IRecordingStopParams) => {
    const { api } = cognigy;

    const strippedConfig = stripEmpty(config);

    api.say('', {
      status: 'recording-stop',
      ...strippedConfig,
    });
  }
});
