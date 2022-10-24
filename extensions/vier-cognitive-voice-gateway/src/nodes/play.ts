import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';
import {
  convertBargeIn,
  normalizeText,
} from "../helpers/util";
import {
  bargeInFieldKeys,
  bargeInFields,
  BargeInInputs,
} from "../common/shared";

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
      fields: ['url'],
      label: t.forward.sectionGeneralLabel,
      defaultCollapsed: false,
    },
    {
      key: 'additional',
      fields: [...bargeInFieldKeys, 'fallbackText'],
      label: t.forward.sectionAdditionalSettingsLabel,
      defaultCollapsed: true,
    },
  ],
  form: [
    {
      key: 'general',
      type: 'section',
    },
    {
      key: 'additional',
      type: 'section',
    },
  ],
  function: async ({ cognigy, config }: IPlayNodeParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'play',
      url: config.url,
      bargeIn: convertBargeIn(config),
      fallbackText: normalizeText(config.fallbackText),
    };

    api.say('', payload);
  },
});
