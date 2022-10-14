import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';
import { promptFields } from './shared';

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
    let submitInputs = [];

    if (config.useSubmitInputs && Array.isArray(config.submitInputs)) {
      submitInputs = config.submitInputs.map((input) => {
        if (input.match(/^DTMF_[1234567890ABCD*#]$/)) {
          return input;
        } else if (input.match(/^[1234567890ABCD*#]$/i)) {
          return `DTMF_${input.toUpperCase()}`;
        }
      });
    }

    api.say(config.text, {
      status: 'prompt',
      timeout: config.timeout * 1000,
      language: config.language || null,
      synthesizers: config.synthesizers.length === 0 ? null : config.synthesizers,
      interpretAs: config.interpretAs || null,
      bargeIn: config.bargeIn,
      type: {
        name: 'Number',
        submitInputs: config.useSubmitInputs ? submitInputs : null,
        maxDigits: config.useMaxDigits ? config.maxDigits : null,
      },
    });
  },
});
