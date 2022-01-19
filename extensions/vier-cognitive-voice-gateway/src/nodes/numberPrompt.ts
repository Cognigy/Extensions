import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
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
  defaultLabel: 'Get Number from Caller',
  summary: 'Say something to the call with a prompt to enter a number',
  appearance: {
    color: '#38eb8c'
  },
  tags: ['message'],
  fields: [
    ...promptFields,
    {
      type: 'checkbox',
      key: 'useSubmitInputs',
      label: 'Use Submit Inputs',
      description: 'Use the Submit Inputs property as a stop condition',
    },
    {
      type: 'textArray',
      key: 'submitInputs',
      label: 'Submit Inputs',
      description: 'One or more synonyms to end an number input, such as DTMF_#',
      condition: {
        key: 'useSubmitInputs',
        value: true
      }
    },
    {
      type: 'checkbox',
      key: 'useMaxDigits',
      label: 'Use Max Digits',
      description: 'Use the Maximum Digits property as a stop condition'
    },
    {
      type: 'number',
      key: 'maxDigits',
      label: 'Maximum Allowed Digits',
      description: 'The maximum amount of digits the number can have. If this property is set, input terminates once the limit has been reached',
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
      label: 'General Settings',
      defaultCollapsed: false,
    },
    {
      key: 'stopCondition',
      fields: ['useSubmitInputs', 'submitInputs', 'useMaxDigits', 'maxDigits'],
      label: 'Stop Condition',
      defaultCollapsed: false,
    },
    {
      key: 'additional',
      fields: ['language', 'synthesizers', 'interpretAs', 'bargeIn'],
      label: 'Additional Settings',
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
