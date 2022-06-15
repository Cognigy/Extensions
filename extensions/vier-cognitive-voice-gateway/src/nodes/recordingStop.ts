import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { stripEmpty } from '../helpers/stripEmpty';
import { t } from '../helpers/translations';

export interface IRecordingStopParams extends INodeFunctionBaseParams {
  config: {
    recordingId?: string,
    terminate?: boolean
  };
}

export const recordingStopNode = createNodeDescriptor({
  type: 'recordingStop',
  defaultLabel:  t('recordingStop.nodeLabel'),
  summary: t('recordingStop.nodeSummary'),
  appearance: {
    color: '#b8f66a'
  },
  tags: ['basic', 'service'],
  fields: [
    {
      type: 'text',
      key: 'recordingId',
      label: t('recordingStop.inputRecordingIdLabel'),
      description: t('recordingStop.inputRecordingIdDescription'),
    },
    {
      type: 'checkbox',
      key: 'terminate',
      description: t('recordingStop.inputTerminateDescription'),
      label: t('recordingStop.inputTerminateLabel'),
    },
  ],
  sections: [
    {
      key: 'additional',
      fields: ['recordingId', 'terminate'],
      label: t('forward.sectionAdditionalSettingsLabel'),
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
