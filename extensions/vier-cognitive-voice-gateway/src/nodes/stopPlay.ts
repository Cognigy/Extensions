import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';

interface IStopPlayNodeInputs {
  url: string,
}

export interface IStopPlayNodeParams extends INodeFunctionBaseParams {
  config: IStopPlayNodeInputs;
}

export const stopPlayNode = createNodeDescriptor({
  type: 'stopPlayAudioFile',
  defaultLabel: t.stopPlay.nodeLabel,
  summary: t.stopPlay.nodeSummary,
  appearance: {
    color: '#678465',
  },
  tags: ['message'],
  fields: [
    {
      type: 'cognigyText',
      key: 'url',
      label: t.stopPlay.inputUrlLabel,
      description: t.stopPlay.inputUrlLabelDescription,
      params: {
        required: true,
        placeholder: '',
      },
    },
  ],
  sections: [
    {
      key: 'general',
      fields: ['url'],
      label: t.forward.sectionGeneralLabel,
      defaultCollapsed: false,
    },
  ],
  form: [
    {
      key: 'general',
      type: 'section',
    },
  ],
  function: async ({ cognigy, config }: IStopPlayNodeParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'play-stop',
      url: config.url,
    };

    api.say('', payload);
  },
});
