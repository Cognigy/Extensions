import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools';
import t from '../translations';
import {
  InterpretAs,
  promptFields,
} from './shared';
import { convertDuration } from "../helpers/util";

export interface IMultipleChoicePromptParams extends INodeFunctionBaseParams {
  config: {
    text: string,
    timeout: number,
    language?: string | null,
    synthesizers?: Array<string>,
    interpretAs?: InterpretAs,
    bargeIn?: boolean,
    choices: object,
  };
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
      key: 'choicesSection',
      type: 'section',
    },
    {
      key: 'additional',
      type: 'section',
    },
  ],
  function: async ({ cognigy, config }: IMultipleChoicePromptParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'prompt',
      timeout: convertDuration(config.timeout),
      language: config.language || null,
      synthesizers: config.synthesizers.length ? config.synthesizers : undefined,
      interpretAs: config.interpretAs,
      bargeIn: !!config.bargeIn,
      type: {
        name: 'MultipleChoice',
        choices: config.choices,
      },
    };
    api.say(config.text, payload);
  },
});
