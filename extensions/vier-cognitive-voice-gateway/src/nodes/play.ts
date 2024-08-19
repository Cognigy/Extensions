import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';
import {
    normalizeText, playInBackgroundToMode,
} from "../helpers/util";
import {
  bargeInFieldsWithToggleToUseDefault,
  bargeInForm,
  BargeInInputsWithToggleToUseDefault,
  bargeInSectionWithToggleToUseDefault,
  convertBargeInIfChanged,
} from "../common/bargeIn";
import {
  generalSection,
  generalSectionFormElement,
} from "../common/shared";

interface IPlayNodeInputs extends BargeInInputsWithToggleToUseDefault {
  url: string,
  fallbackText?: string,
  playInBackground: boolean,
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
      condition: {
        key: 'playInBackground',
        value: false,
      }
    },
    {
      type: 'toggle',
      key: 'playInBackground',
      label: t.play.playInBackgroundLabel,
      description: t.play.playInBackgroundDescription,
      defaultValue: false,
    },
    ...bargeInFieldsWithToggleToUseDefault(),
  ],
  sections: [
    generalSection(['url', 'fallbackText', 'playInBackground']),
    bargeInSectionWithToggleToUseDefault({
      key: 'playInBackground',
      value: false,
    }),
  ],
  form: [
    generalSectionFormElement,
    bargeInForm,
  ],
  function: async ({ cognigy, config }: IPlayNodeParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'play',
      url: config.url,
      mode: playInBackgroundToMode(config.playInBackground),
      bargeIn: undefined,
      fallbackText: undefined,
    };
    if (!config.playInBackground) {
      payload.bargeIn = convertBargeInIfChanged(api, config)
      payload.fallbackText = normalizeText(config.fallbackText)
    }

    api.say('', payload);
  },
});
