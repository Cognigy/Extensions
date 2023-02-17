import {
  INodeExecutionAPI,
  INodeField,
  INodeFieldAndSectionFormElement,
  INodeSection,
} from "@cognigy/extension-tools/build/interfaces/descriptor";
import t from "../translations";

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

  let phraseSet = new Set<string>();
  if (Array.isArray(inputs.bargeInPhraseList)) {
    for (const phrase of inputs.bargeInPhraseList) {
      if (typeof phrase === 'string') {
        const trimmed = phrase.trim();
        if (trimmed.length > 0) {
          phraseSet.add(trimmed);
        }
      } else {
        api.log('error', `Discarded a phrase from the UI: ${phrase}`);
      }
    }
  }
  if (!!inputs.bargeInPhraseListFromContext) {
    const contextValue = api.getContext(inputs.bargeInPhraseListFromContext);
    if (Array.isArray(contextValue)) {
      for (let phrase of contextValue) {
        if (typeof phrase === 'string') {
          phraseSet.add(phrase);
        } else {
          api.log('error', `Discarded a phrase from the context key ${inputs.bargeInPhraseListFromContext}: ${phrase}`);
        }
      }
    } else {
      api.log('error', `Context key ${inputs.bargeInPhraseListFromContext} did not contain an array!`);
    }
  }
  const phraseList = phraseSet.size > 0 ? [...phraseSet] : undefined;

  return {
    onSpeech: !!inputs.bargeInOnSpeech,
    onDtmf: !!inputs.bargeInOnDtmf,
    confidence,
    phraseList,
  };
}