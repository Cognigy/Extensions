import { INodeExecutionAPI, INodeField } from "@cognigy/extension-tools/build/interfaces/descriptor";
import t from "../translations";
import { convertLanguageSelect, languageSelectField } from "./shared";
import { BargeInInputsWithToggleToUseDefault, bargeInFieldsWithToggleToUseDefault, convertBargeInRespectToggleToUseDefault } from "./bargeIn";
import { SynthesizersInputsWithToggleToUseDefault, convertSynthesiersRespectToggleToUseDefault, synthesizersFieldWithToggleToUseDefault } from "./synthesizers";
import { convertDurationFromSecondsToMillis } from "../helpers/util";

export interface PromptInputs extends BargeInInputsWithToggleToUseDefault, SynthesizersInputsWithToggleToUseDefault {
  text: string,
  timeout: number,
  language?: string,
}

export function promptFieldsToPayload(api: INodeExecutionAPI, config: PromptInputs) {
  return {
      status: 'prompt',
      timeout: convertDurationFromSecondsToMillis(config.timeout),
      language: convertLanguageSelect(config.language),
      synthesizers: convertSynthesiersRespectToggleToUseDefault(config),
      bargeIn: convertBargeInRespectToggleToUseDefault(api, config),
    }
}

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
  ...synthesizersFieldWithToggleToUseDefault(),
  ...bargeInFieldsWithToggleToUseDefault(),
];
