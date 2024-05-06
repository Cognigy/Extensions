import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools';
import t from '../translations';
import {
  bargeInForm,
  bargeInSectionWithToggleToUseDefault,
} from "../common/bargeIn";
import { promptFields, promptFieldsToPayload, PromptInputs } from "../common/prompt";
import {
  generalSection,
  generalSectionFormElement,
} from "../common/shared";
import {
  synthesizersWithToggleToUseDefaultFieldKeys
} from '../common/synthesizers';

interface IMultipleChoicePromptNodeInputs extends PromptInputs {
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
    generalSection(['text', 'timeout']),
    {
      key: 'choicesSection',
      fields: ['choices'],
      label: t.multipleChoicePrompt.sectionChoicesSectionLabel,
      defaultCollapsed: false,
    },
    bargeInSectionWithToggleToUseDefault,
    {
      key: 'additional', // This should probably be something like tts, but we cannot simply change the name of the key as it would be a breaking change.
      fields: ['language', ...synthesizersWithToggleToUseDefaultFieldKeys],
      label: t.shared.sectionTTSLabel,
      defaultCollapsed: true,
    },
  ],
  form: [
    generalSectionFormElement,
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
      ...promptFieldsToPayload(api, config),
      type: {
        name: 'MultipleChoice',
        choices: config.choices,
      },
    };
    api.say(config.text, payload);
  },
});
