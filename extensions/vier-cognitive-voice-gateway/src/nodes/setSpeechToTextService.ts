import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import {
  INodeField,
  INodeFieldTranslations,
} from '@cognigy/extension-tools/build/interfaces/descriptor';
import t from '../translations';

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

export interface ISetSpeechToTextServiceParams extends INodeFunctionBaseParams {
  config: {
    language?: string,
    transcriber: string,
    profileToken?: string,
    transcriberFallback?: string,
    profileTokenFallback?: string,
  };
}

const generateTranscriberSelect = (key: string, label: INodeFieldTranslations, description: INodeFieldTranslations): INodeField => ({
  type: 'text',
  key,
  label,
  description,
  params: {
    required: false,
  },
});

const generateProfileTokenInput = (key: string, label: INodeFieldTranslations, description: INodeFieldTranslations): INodeField => ({
  type: 'text',
  key,
  label,
  description,
  params: {
    required: false,
    placeholder: '',
  },
  condition: {
    key: 'transcriber',
    value: '',
  },
});

export const setSpeechtoTextServiceNode = createNodeDescriptor({
  type: 'speechToText',
  defaultLabel: t.speechToText.nodeLabel,
  summary: t.speechToText.nodeSummary,
  appearance: {
    color: 'blue',
  },
  tags: ['service'],
  fields: [
    generateTranscriberSelect('transcriber', t.speechToText.inputServiceLabel, t.speechToText.inputTranscriberDescription),
    generateProfileTokenInput('profileToken', t.speechToText.inputProfileTokenLabel, t.speechToText.inputProfileTokenDescription),
    generateTranscriberSelect('transcriberFallback', t.speechToText.inputServiceFallbackLabel, t.speechToText.inputTranscriberDescription),
    generateProfileTokenInput('profileTokenFallback', t.speechToText.inputProfileTokenFallbackLabel, t.speechToText.inputProfileTokenFallbackDescription),
    {
      type: 'select',
      key: 'language',
      label: t.speechToText.inputLanguageLabel,
      params: {
        required: true,
        options: supportedLanguages.map(lang => {
          return { value: lang, label: lang };
        }),
      },
    },
  ],
  sections: [
    {
      key: 'selectMainSTT',
      fields: ['transcriber', 'profileToken'],
      label: t.speechToText.sectionSelectSTTLabel,
      defaultCollapsed: false,
    },
    {
      key: 'selectFallbackSTT',
      fields: ['transcriberFallback', 'profileTokenFallback'],
      label: t.speechToText.sectionFallback,
      defaultCollapsed: true,
    },
  ],
  preview: {
    key: 'transcriber',
    type: 'text',
  },
  form: [
    {
      key: 'language',
      type: 'field',
    },
    {
      key: 'selectMainSTT',
      type: 'section',
    },
    {
      key: 'selectFallbackSTT',
      type: 'section',
    },
  ],
  function: async ({ cognigy, config }: ISetSpeechToTextServiceParams) => {
    const { api } = cognigy;
    const transcriber = [];

    if (config.profileToken) {
      transcriber.push(config.profileToken);
    } else if (config.transcriber) {
      transcriber.push(config.transcriber);
    }

    if (config.profileTokenFallback) {
      transcriber.push(config.profileTokenFallback);
    } else if (config.transcriberFallback) {
      transcriber.push(config.transcriberFallback);
    }

    const payload = {
      status: 'transcription-switch',
      language: config.language,
      transcribers: transcriber.length ? transcriber : null,
    };
    api.say('', payload);
  },
});