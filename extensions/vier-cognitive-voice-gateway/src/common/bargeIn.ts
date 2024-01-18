import {
  INodeExecutionAPI,
  INodeField,
  INodeFieldAndSectionFormElement,
  INodeSection,
} from "@cognigy/extension-tools/build/interfaces/descriptor";
import t from "../translations";
import {
  getStringListFromContext,
  normalizeText,
  normalizeTextArray,
} from "../helpers/util";

export interface BargeInInputs {
  bargeInOnSpeech?: boolean;
  bargeInOnDtmf?: boolean;
  bargeInConfidence?: number;
  bargeInPhraseList?: Array<string>;
  bargeInPhraseListFromContext?: string;
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
    type: 'number',
    key: 'bargeInConfidence',
    label: t.bargeIn.input.confidenceLabel,
    description: t.bargeIn.input.confidenceDescription,
    defaultValue: undefined,
    params: {
      min: 0,
      max: 100,
    },
    condition: {
      key: 'bargeInOnSpeech',
      value: true,
    },
  },
  {
    type: 'textArray',
    key: 'bargeInPhraseList',
    label: t.bargeIn.input.phraseListLabel,
    description: t.bargeIn.input.phraseListDescription,
    defaultValue: undefined,
    condition: {
      key: 'bargeInOnSpeech',
      value: true,
    },
  },
  {
    type: 'cognigyText',
    key: 'bargeInPhraseListFromContext',
    label: t.bargeIn.input.phraseListFromContextLabel,
    description: t.bargeIn.input.phraseListFromContextDescription,
    defaultValue: undefined,
    condition: {
      key: 'bargeInOnSpeech',
      value: true,
    },
  },
  {
    type: 'toggle',
    key: 'bargeInOnDtmf',
    label: t.bargeIn.input.onDtmfLabel,
    description: t.bargeIn.input.onDtmfDescription,
    defaultValue: false,
  },
];

export const bargeInFieldKeys: readonly string[] = bargeInFields.map(field => field.key);

export const bargeInSection: INodeSection = {
  key: 'bargeIn',
  fields: [...bargeInFieldKeys],
  label: t.bargeIn.section.label,
  defaultCollapsed: true,
};

export const bargeInForm: INodeFieldAndSectionFormElement = {
  key: 'bargeIn',
  type: 'section',
};

export interface BargeInOptions {
  onSpeech: boolean;
  onDtmf: boolean;
  confidence?: number;
  phraseList?: Array<string>;
}

export function convertBargeIn(api: INodeExecutionAPI, inputs: BargeInInputs): BargeInOptions {
  let confidence: number | undefined = undefined;
  if (typeof inputs.bargeInConfidence === 'number') {
    confidence = inputs.bargeInConfidence;
  }

  const phraseSet = new Set<string>(normalizeTextArray(inputs.bargeInPhraseList) ?? []);
  const phraseListContextKey = normalizeText(inputs.bargeInPhraseListFromContext)
  if (phraseListContextKey) {
    getStringListFromContext(api, phraseListContextKey).forEach(s => phraseSet.add(s))
  }
  const phraseList = phraseSet.size > 0 ? [...phraseSet] : undefined;

  return {
    onSpeech: !!inputs.bargeInOnSpeech,
    onDtmf: !!inputs.bargeInOnDtmf,
    confidence,
    phraseList,
  };
}