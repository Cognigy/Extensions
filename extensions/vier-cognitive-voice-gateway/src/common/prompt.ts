import { INodeField } from "@cognigy/extension-tools/build/interfaces/descriptor";
import t from "../translations";
import { languageSelectField } from "./shared";
import { bargeInFieldsWithToggleToUseDefault } from "./bargeIn";

export const promptFields: Array<INodeField> = [
  {
    type: 'cognigyText',
    key: 'text',
    label: t.shared.inputTextLabel,
    description: t.shared.inputTextDescription,
    params: {
      required: true,
    },
  },
  {
    type: 'number',
    key: 'timeout',
    label: t.shared.inputTimeoutLabel,
    description: t.shared.inputTimeoutDescription,
    params: {
      required: true,
    },
  },
  languageSelectField('language', false, t.shared.inputLanguageLabel, t.shared.inputLanguageDescription),
  {
    type: 'textArray',
    key: 'synthesizers',
    label: t.shared.inputSynthesizersLabel,
    description: t.shared.inputSynthesizersDescription,
  },
  ...bargeInFieldsWithToggleToUseDefault(),
];
