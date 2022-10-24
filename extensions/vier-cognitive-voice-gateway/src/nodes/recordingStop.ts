import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import {
  normalizeText,
} from '../helpers/util';
import t from '../translations';

export interface IRecordingStopParams extends INodeFunctionBaseParams {
  config: {
    recordingId?: string,
    terminate?: boolean
  };
}

export const recordingStopNode = createNodeDescriptor({
  type: 'recordingStop',
  defaultLabel: t.recordingStop.nodeLabel,
  summary: t.recordingStop.nodeSummary,
  appearance: {
    color: '#b8f66a',
  },
  tags: ['basic', 'service'],
  fields: [
    {
      type: 'text',
      key: 'recordingId',
      label: t.shared.inputRecordingIdLabel,
      description: t.shared.inputRecordingIdDescription,
    },
    {
      type: 'toggle',
      key: 'terminate',
      description: t.recordingStop.inputTerminateDescription,
      label: t.recordingStop.inputTerminateLabel,
    },
  ],
  preview: {
    type: 'text',
    key: 'recordingId',
  },
  function: async ({ cognigy, config }: IRecordingStopParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'recording-stop',
      recordingId: normalizeText(config.recordingId),
      terminate: !!config.terminate,
    };
    api.say('', payload);
  },
});
