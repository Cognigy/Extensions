import {
  INodeField,
  INodeFieldAndSectionFormElement,
  INodeSection,
} from "@cognigy/extension-tools/build/interfaces/descriptor";
import t from "../translations";

export type BargeInInputs = {
  bargeInOnSpeech?: boolean,
  bargeInOnDtmf?: boolean,
  bargeInConfidence?: number,
  bargeInPhraseList?: Array<string>,
}

export const bargeInFields: Array<INodeField> = [
  {
    type: 'toggle',
    key: 'bargeInOnSpeech',
    label: t.bargeIn.input.onSpeechLabel,
    description: t.bargeIn.input.onSpeechDescription,
    defaultValue: false,
  },
  {
    type: 'toggle',
    key: 'bargeInOnDtmf',
    label: t.bargeIn.input.onDtmfLabel,
    description: t.bargeIn.input.onDtmfDescription,
    defaultValue: false,
  },
  {
    type: 'number',
    key: 'bargeInConfidence',
    label: t.bargeIn.input.confidenceLabel,
    description: t.bargeIn.input.confidenceDescription,
    defaultValue: undefined,
    params: {
      min: 0,
      max: 100,
    },
  },
  {
    type: 'textArray',
    key: 'bargeInPhraseList',
    label: t.bargeIn.input.phraseListLabel,
    description: t.bargeIn.input.phraseListDescription,
    defaultValue: undefined,
  },
];

export const bargeInFieldKeys: readonly string[] = bargeInFields.map(field => field.key);

export const bargeInSection: INodeSection = {
  key: 'bargeIn',
  fields: [...bargeInFieldKeys],
  label: t.bargeIn.section.label,
  defaultCollapsed: true,
}

export const bargeInForm: INodeFieldAndSectionFormElement = {
  key: 'bargeIn',
  type: 'section',
}

export interface BargeInOptions {
  onSpeech: boolean
  onDtmf: boolean
  confidence?: number
  phraseList?: Array<string>
}

export function convertBargeIn(inputs: BargeInInputs): BargeInOptions {
  let confidence: number | undefined = undefined;
  if (typeof inputs.bargeInConfidence === 'number') {
    confidence = inputs.bargeInConfidence
  }

  let phraseList: Array<string> | undefined = undefined
  if (Array.isArray(inputs.bargeInPhraseList)) {
    const phraseSet = new Set<string>(inputs.bargeInPhraseList.map(it => it.trim()).filter(it => it.length > 0))
    if (phraseSet.size > 0) {
      phraseList = [...phraseSet]
    }
  }

  return {
    onSpeech: !!inputs.bargeInOnSpeech,
    onDtmf: !!inputs.bargeInOnDtmf,
    confidence,
    phraseList,
  };
}