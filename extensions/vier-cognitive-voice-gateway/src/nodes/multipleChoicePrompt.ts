import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools';
import t from '../translations';
import {
  convertDurationFromSecondsToMillis,
  normalizeTextArray,
} from "../helpers/util";
import {
  bargeInFields,
  bargeInForm,
  BargeInInputs,
  bargeInSection,
  convertBargeIn,
} from "../common/bargeIn";
import { promptFields } from "../common/prompt";

interface IMultipleChoicePromptNodeInputs extends BargeInInputs {
  text: string,
  timeout: number,
  language?: string,
  synthesizers?: Array<string>,
  choices: object,
}

export interface IMultipleChoicePromptParams extends INodeFunctionBaseParams {
  config: IMultipleChoicePromptNodeInputs;
}

export const promptForMultipleChoice = createNodeDescriptor({
  type: 'multipleChoicePrompt',
  defaultLabel: t.multipleChoicePrompt.nodeLabel,
  summary: t.multipleChoicePrompt.nodeSummary,
  appearance: {
    color: '#9a4a21',
  },
  tags: ['message'],
  fields: [
    ...promptFields,
    ...bargeInFields,
    {
      type: 'json',
      label: t.multipleChoicePrompt.inputChoicesLabel,
      key: 'choices',
      description: t.multipleChoicePrompt.inputChoicesDescription,
      defaultValue: '{\n\
\t"yes": [\n\
\t\t"yes",\n\
\t\t"yeah",\n\
\t\t"affirmative",\n\
\t\t"DTMF_1"\n\
\t],\n\
\t"no": [\n\
\t\t"no",\n\
\t\t"never",\n\
\t\t"negative",\n\
\t\t"DTMF_0"\n\
\t]\n\
}',
      params: {
        required: true,
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
      key: 'choicesSection',
      fields: ['choices'],
      label: t.multipleChoicePrompt.sectionChoicesSectionLabel,
      defaultCollapsed: false,
    },
    bargeInSection,
    {
      key: 'additional',
      fields: ['language', 'synthesizers'],
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
      key: 'choicesSection',
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
  function: async ({ cognigy, config }: IMultipleChoicePromptParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'prompt',
      timeout: convertDurationFromSecondsToMillis(config.timeout),
      language: config.language ? config.language : undefined,
      synthesizers: normalizeTextArray(config.synthesizers),
      bargeIn: convertBargeIn(api, config),
      type: {
        name: 'MultipleChoice',
        choices: config.choices,
      },
    };
    api.say(config.text, payload);
  },
});
