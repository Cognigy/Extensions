import {
  INodeField,
  INodeFieldTranslations,
} from '@cognigy/extension-tools/build/interfaces/descriptor';
import t from '../translations';

export type InterpretAs = 'SSML' | 'TEXT';

/**
 * This list is sorted lexicographically, with 4 exceptions:
 *   1. en-US
 *   2. en-GB
 *   3. de-DE
 *   4. fr-FR
 * These have been moved to the start of the list as they are likely going to be the most used languages.
 */
const supportedLanguages: readonly string[] = [
  'en-US',
  'en-GB',
  'de-DE',
  'fr-FR',
  'ar-EG',
  'ar-SA',
  'bg-BG',
  'bn-IN',
  'ca-ES',
  'cs-CZ',
  'da-DK',
  'de-AT',
  'de-CH',
  'el-GR',
  'en-AU',
  'en-IN',
  'es-ES',
  'es-MX',
  'es-US',
  'et-EE',
  'fi-FI',
  'fil-PH',
  'fr-BE',
  'fr-CA',
  'fr-CH',
  'gu-IN',
  'he-IL',
  'hi-IN',
  'hr-HR',
  'hu-HU',
  'id-ID',
  'is-IS',
  'it-IT',
  'ja-JP',
  'kn-IN',
  'ko-KR',
  'lt-LT',
  'lv-LV',
  'ml-IN',
  'ms-MY',
  'nb-NO',
  'nl-BE',
  'nl-NL',
  'pl-PL',
  'pt-BR',
  'pt-PT',
  'ro-RO',
  'ru-RU',
  'sk-SK',
  'sl-SI',
  'sr-RS',
  'sv-SE',
  'ta-IN',
  'te-IN',
  'th-TH',
  'tr-TR',
  'uk-UA',
  'vi-VN',
  'yue-Hant-HK',
  'zh',
  'zh-HK',
  'zh-TW',
];

export function languageSelectField(key: string, required: boolean, label: INodeFieldTranslations, description?: INodeFieldTranslations): INodeField {
  const extraEntries = required ? [] : [{ value: null, label: 'n/a' }];
  const languageEntries = supportedLanguages.map(lang => {
    return { value: lang, label: lang };
  });

  return {
    type: 'select',
    key: key,
    label: label,
    description: description,
    params: {
      required: required,
      options: extraEntries.concat(languageEntries),
    },
  };
}

export type BargeInInputs = {
  bargeInOnSpeech?: boolean,
  bargeInOnDtmf?: boolean,
}

export const bargeInFields: Array<INodeField> = [
  {
    type: 'checkbox',
    key: 'bargeInOnSpeech',
    label: t.shared.inputBargeInOnSpeechLabel,
    description: t.shared.inputBargeInOnSpeechDescription,
    defaultValue: false,
  },
  {
    type: 'checkbox',
    key: 'bargeInOnDtmf',
    label: t.shared.inputBargeInOnDtmfLabel,
    description: t.shared.inputBargeInOnDtmfDescription,
    defaultValue: false,
  },
];

export const bargeInFieldKeys: readonly string[] = bargeInFields.map(field => field.key);

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
  {
    type: 'select',
    key: 'interpretAs',
    label: t.shared.inputInterpretAsLabel,
    description: t.shared.inputInterpretAsDescription,
    params: {
      options: [
        {
          value: 'SSML',
          label: 'SSML',
        },
        {
          value: 'TEXT',
          label: 'Text',
        },
      ],
    },
  },
  ...bargeInFields,
];

export const commonRedirectFields: Array<INodeField> = [
  {
    type: 'cognigyText',
    key: 'callerId',
    label: t.shared.inputCallerIdLabel,
    description: t.shared.inputCallerIdDescription,
    params: {
      placeholder: '+E.164 format, e.g. "+49721480848680"',
    },
  },
  {
    type: 'json',
    key: 'customSipHeaders',
    label: t.shared.inputCustomSipHeadersLabel,
    description: t.shared.inputCustomSipHeadersDescription,
  },
  {
    type: 'number',
    key: 'ringTimeout',
    label: t.shared.inputRingTimeoutLabel,
    description: t.shared.inputRingTimeoutDescription,
    defaultValue: 15,
    params: {
      placeholder: 'Value in Seconds, e.g. 60 for 1 minute',
      min: 10,
      max: 120,
    },
  },
  {
    type: 'checkbox',
    key: 'acceptAnsweringMachines',
    label: t.shared.inputAcceptAnsweringMachinesLabel,
    description: t.shared.inputAcceptAnsweringMachinesDescription,
    defaultValue: false,
  },
  {
    type: 'json',
    key: 'data',
    label: t.shared.inputDataLabel,
    description: t.shared.inputDataDescription,
  },
  {
    type: 'checkbox',
    key: 'endFlow',
    label: t.shared.inputEndFlowLabel,
    defaultValue: false,
    description: t.shared.inputEndFlowDescription,
  },
  {
    type: 'checkbox',
    key: 'experimentalEnableRingingTone',
    label: t.shared.inputExperimentalEnableRingingToneLabel,
    description: t.shared.inputExperimentalEnableRingingToneDescription,
    defaultValue: false,
  },
  {
    type: 'cognigyText',
    key: 'whisperingText',
    label: t.shared.inputWhisperingTextLabel,
    description: t.shared.inputWhisperingTextDescription,
  },
];
