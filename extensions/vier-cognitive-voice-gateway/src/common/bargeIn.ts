import {
  INodeExecutionAPI,
  INodeField,
  INodeFieldAndSectionFormElement,
  INodeSection,
  TNodeFieldCondition,
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

export interface BargeInInputsWithToggleToUseDefault extends BargeInInputs {
  changeBargeIn: boolean;
}

export function bargeInFields(
  condition: TNodeFieldCondition,
): Array<INodeField> {
  return [
    {
      type: 'toggle',
      key: 'bargeInOnSpeech',
      label: t.bargeIn.input.onSpeechLabel,
      description: t.bargeIn.input.onSpeechDescription,
      defaultValue: false,
      condition: condition,
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
      condition: condition,
    },
  ]
}

export function bargeInFieldsWithToggleToUseDefault(): Array<INodeField> {
  const changeBargeInKey = 'changeBargeIn';
  return [
    {
      type: 'toggle',
      key: changeBargeInKey,
      label: t.bargeIn.useDefaultToggleLabel,
      description: t.bargeIn.useDefaultToggleDescription,
      defaultValue: false,
    },
    ...bargeInFields({
      key: changeBargeInKey,
      value: true,
    }),
  ];
}

export const bargeInFieldKeys: readonly string[] = bargeInFields(null).map(field => field.key);
export const bargeInFieldWithToggleToUseDefaultKeys: readonly string[] = bargeInFieldsWithToggleToUseDefault().map(field => field.key);

export const bargeInSectionWithToggleToUseDefault: INodeSection = {
  key: 'bargeIn',
  fields: [...bargeInFieldWithToggleToUseDefaultKeys],
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
  const phraseListContextKey = normalizeText(inputs.bargeInPhraseListFromContext);
  if (phraseListContextKey) {
    getStringListFromContext(api, phraseListContextKey).forEach(s => phraseSet.add(s));
  }
  phraseSet.delete(undefined)
  const phraseList = phraseSet.size > 0 ? [...phraseSet] : null;

  return {
    onSpeech: !!inputs.bargeInOnSpeech,
    onDtmf: !!inputs.bargeInOnDtmf,
    confidence: confidence,
    phraseList: phraseList,
  };
}

export function convertBargeInRespectToggleToUseDefault(api: INodeExecutionAPI, inputs: BargeInInputsWithToggleToUseDefault): BargeInOptions | null {
  if (!inputs.changeBargeIn) {
    return null
  } else {
    return convertBargeIn(api, inputs)
  }
}
