import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';
import {
  normalizeText,
} from "../helpers/util";
import {
  bargeInFields,
  bargeInForm,
  BargeInInputs,
  bargeInSection,
  convertBargeIn,
} from "../common/bargeIn";

interface IPlayNodeInputs extends BargeInInputs {
  url: string,
  fallbackText?: string,
}

export interface IPlayNodeParams extends INodeFunctionBaseParams {
  config: IPlayNodeInputs;
}

export const playNode = createNodeDescriptor({
  type: 'playAudioFile',
  defaultLabel: t.play.nodeLabel,
  summary: t.play.nodeSummary,
  appearance: {
    color: '#678465',
  },
  tags: ['message'],
  fields: [
    {
      type: 'cognigyText',
      key: 'url',
      label: t.play.inputUrlLabel,
      description: t.play.inputUrlLabelDescription,
      params: {
        required: true,
        placeholder: '',
      },
    },
    {
      type: 'cognigyText',
      key: 'fallbackText',
      label: t.play.inputFallbackTextLabel,
      description: t.play.inputFallbackTextDescription,
      params: {
        required: false,
        placeholder: '',
      },
    },
    ...bargeInFields,
  ],
  sections: [
    {
      key: 'general',
      fields: ['url', 'fallbackText'],
      label: t.forward.sectionGeneralLabel,
      defaultCollapsed: false,
    },
    bargeInSection,
  ],
  form: [
    {
      key: 'general',
      type: 'section',
    },
    bargeInForm,
  ],
  function: async ({ cognigy, config }: IPlayNodeParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'play',
      url: config.url,
      bargeIn: convertBargeIn(api, config),
      fallbackText: normalizeText(config.fallbackText),
    };

    api.say('', payload);
  },
});
