import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { t } from '../helpers/translations';
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
  defaultLabel: t('promptForNumber.nodeLabel'), 
  summary: t('promptForNumber.nodeSummary'),
  appearance: {
    color: '#38eb8c'
  },
  tags: ['message'],
  fields: [
    ...promptFields,
    {
      type: 'checkbox',
      key: 'useSubmitInputs',
      label: t('promptForNumber.inputUseSubmitInputsLabel'),
      description: t('promptForNumber.inputUseSubmitInputsDescription'),
    },
    {
      type: 'textArray',
      key: 'submitInputs',
      label: t('promptForNumber.inputSubmitInputsLabel'),
      description: t('promptForNumber.inputSubmitInputsDescription'),
      condition: {
        key: 'useSubmitInputs',
        value: true
      }
    },
    {
      type: 'checkbox',
      key: 'useMaxDigits',
      label: t('promptForNumber.inputUseMaxDigitsLabel'),
      description: t('promptForNumber.inputUseMaxDigitsDescription'),
    },
    {
      type: 'number',
      key: 'maxDigits',
      label: t('promptForNumber.inputMaxDigitsLabel'),
      description: t('promptForNumber.inputMaxDigitsDescription'),
      condition: {
        key: 'useMaxDigits',
        value: true
      },
      params: {
        min: 1
      }
    },
  ],
  sections: [
    {
      key: 'general',
      fields: ['text', 'timeout'],
      label: t('forward.sectionGeneralLabel'),
      defaultCollapsed: false,
    },
    {
      key: 'stopCondition',
      fields: ['useSubmitInputs', 'submitInputs', 'useMaxDigits', 'maxDigits'],
      label: t('promptForNumber.sectionStopConditionLabel'),
      defaultCollapsed: false,
    },
    {
      key: 'additional',
      fields: ['language', 'synthesizers', 'interpretAs', 'bargeIn'],
      label: t('forward.sectionAdditionalSettingsLabel'),
      defaultCollapsed: true,
    }
  ],
  form: [
    {
      key: 'general',
      type: 'section'
    },
    {
      key: 'stopCondition',
      type: 'section'
    },
    {
      key: 'additional',
      type: 'section'
    }
  ],
  function: async ({ cognigy, config }: INumberPromptNodeParams) => {
    const { api } = cognigy;

    api.say(config.text, {
      status: 'prompt',
      timeout: config.timeout * 1000,
      language: config.language || null,
      synthesizers: config.synthesizers.length === 0 ? null : config.synthesizers,
      interpretAs: config.interpretAs || null,
      bargeIn: config.bargeIn,
      type: {
        name: 'Number',
        submitInputs: config.useSubmitInputs ? config.submitInputs : null,
        maxDigits: config.useMaxDigits ? config.maxDigits : null,
      }
    });
  }
});
