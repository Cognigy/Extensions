import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';
import { promptFields } from './shared';
import { convertDuration } from "../helpers/util";

export interface INumberPromptNodeParams extends INodeFunctionBaseParams {
  config: {
    text: string,
    timeout: number,
    language?: string,
    synthesizers?: Array<string>,
    interpretAs?: string,
    bargeIn?: boolean,
    submitInputs?: Array<string>,
    maxDigits?: number,
    useSubmitInputs: boolean,
    useMaxDigits: boolean
  };
}

export const promptForNumberNode = createNodeDescriptor({
  type: 'numberPrompt',
  defaultLabel: t.promptForNumber.nodeLabel,
  summary: t.promptForNumber.nodeSummary,
  appearance: {
    color: '#38eb8c',
  },
  tags: ['message'],
  fields: [
    ...promptFields,
    {
      type: 'checkbox',
      key: 'useSubmitInputs',
      label: t.shared.inputUseSubmitInputsLabel,
      description: t.shared.inputUseSubmitInputsDescription,
    },
    {
      type: 'textArray',
      key: 'submitInputs',
      label: t.shared.inputSubmitInputsLabel,
      description: t.shared.inputSubmitInputsDescription,
      condition: {
        key: 'useSubmitInputs',
        value: true,
      },
    },
    {
      type: 'checkbox',
      key: 'useMaxDigits',
      label: t.shared.inputUseMaxDigitsLabel,
      description: t.shared.inputUseMaxDigitsDescription,
    },
    {
      type: 'number',
      key: 'maxDigits',
      label: t.shared.inputMaxDigitsLabel,
      description: t.promptForNumber.inputMaxDigitsDescription,
      condition: {
        key: 'useMaxDigits',
        value: true,
      },
      params: {
        min: 1,
      },
    },
  ],
  sections: [
    {
      key: 'general',
      fields: ['text', 'timeout'],
      label: t.forward.sectionGeneralLabel,
      defaultCollapsed: false,
    },
    {
      key: 'stopCondition',
      fields: ['useSubmitInputs', 'submitInputs', 'useMaxDigits', 'maxDigits'],
      label: t.shared.sectionStopConditionLabel,
      defaultCollapsed: false,
    },
    {
      key: 'additional',
      fields: ['language', 'synthesizers', 'interpretAs', 'bargeIn'],
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
      key: 'stopCondition',
      type: 'section',
    },
    {
      key: 'additional',
      type: 'section',
    },
  ],
  function: async ({ cognigy, config }: INumberPromptNodeParams) => {
    const { api } = cognigy;
    let submitInputs = undefined;

    if (Array.isArray(config.submitInputs)) {
      submitInputs = config.submitInputs.map((input) => {
        if (input.match(/^[1234567890ABCD*#]$/i)) {
          return `DTMF_${input.toUpperCase()}`;
        }
        return input;
      });
    }

    const payload = {
      status: 'prompt',
      timeout: convertDuration(config.timeout),
      language: config.language || null,
      synthesizers: config.synthesizers.length ? config.synthesizers : undefined,
      interpretAs: config.interpretAs,
      bargeIn: !!config.bargeIn,
      type: {
        name: 'Number',
        submitInputs: config.useSubmitInputs ? submitInputs : undefined,
        maxDigits: config.useMaxDigits ? config.maxDigits : undefined,
      },
    };
    api.say(config.text, payload);
  },
});
