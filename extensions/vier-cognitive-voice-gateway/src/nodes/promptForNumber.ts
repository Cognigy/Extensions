import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';
import {
  convertDurationFromSecondsToMillis,
  DEFAULT_NUMBER_VALUE,
  normalizeInteger,
  normalizeTextArray,
} from "../helpers/util";
import {
  bargeInFieldsWithToggleToUseDefault,
  bargeInForm,
  BargeInInputs,
  bargeInSectionWithToggleToUseDefault,
  convertBargeIn,
} from "../common/bargeIn";
import { promptFields } from "../common/prompt";
import {
  generalSection,
  generalSectionFormElement,
} from "../common/shared";

interface INumberPromptNodeInputs extends BargeInInputs {
  text: string,
  timeout: number,
  language?: string,
  synthesizers?: Array<string>,
  submitInputs?: Array<string>,
  minDigits?: number,
  maxDigits?: number,
}

export interface INumberPromptNodeParams extends INodeFunctionBaseParams {
  config: INumberPromptNodeInputs;
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
    ...bargeInFieldsWithToggleToUseDefault(),
    {
      type: 'textArray',
      key: 'submitInputs',
      label: t.promptForNumber.inputSubmitInputsLabel,
      description: t.promptForNumber.inputSubmitInputsDescription,
    },
    {
      type: 'number',
      key: 'minDigits',
      label: t.promptForNumber.inputMinDigitsLabel,
      description: t.promptForNumber.inputMinDigitsDescription,
      defaultValue: DEFAULT_NUMBER_VALUE,
      params: {
        min: 1,
      },
    },
    {
      type: 'number',
      key: 'maxDigits',
      label: t.promptForNumber.inputMaxDigitsLabel,
      description: t.promptForNumber.inputMaxDigitsDescription,
      defaultValue: DEFAULT_NUMBER_VALUE,
      params: {
        min: 1,
      },
    },
  ],
  sections: [
    generalSection(['text', 'timeout']),
    {
      key: 'stopCondition',
      fields: ['submitInputs', 'minDigits', 'maxDigits'],
      label: t.shared.sectionStopConditionLabel,
      defaultCollapsed: false,
    },
    bargeInSectionWithToggleToUseDefault,
    {
      key: 'additional',
      fields: ['language', 'synthesizers'],
      label: t.forward.sectionAdditionalSettingsLabel,
      defaultCollapsed: true,
    },
  ],
  form: [
    generalSectionFormElement,
    {
      key: 'stopCondition',
      type: 'section',
    },
    bargeInForm,
    {
      key: 'additional',
      type: 'section',
    },
  ],
  preview: {
    key: 'text',
    type: 'text',
  },
  function: async ({ cognigy, config }: INumberPromptNodeParams) => {
    const { api } = cognigy;
    let submitInputs = normalizeTextArray(config.submitInputs);

    if (submitInputs) {
      submitInputs = submitInputs.map(input => {
        if (input.match(/^[1234567890ABCD*#]$/i)) {
          return `DTMF_${input.toUpperCase()}`;
        }
        return input;
      });
    }

    const maxDigits = normalizeInteger(config.maxDigits, 1, undefined);
    const payload = {
      status: 'prompt',
      timeout: convertDurationFromSecondsToMillis(config.timeout),
      language: config.language ? config.language : undefined,
      synthesizers: normalizeTextArray(config.synthesizers),
      bargeIn: convertBargeIn(api, config),
      type: {
        name: 'Number',
        submitInputs: submitInputs,
        minDigits: normalizeInteger(config.minDigits, undefined, maxDigits),
        maxDigits: maxDigits,
      },
    };
    api.say(config.text, payload);
  },
});
