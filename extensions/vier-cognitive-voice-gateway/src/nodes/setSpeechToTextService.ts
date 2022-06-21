import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { INodeField, INodeFieldTranslations } from '@cognigy/extension-tools/build/interfaces/descriptor';
import { t } from '../helpers/translations';

export interface ISetSpeechToTextServiceParams extends INodeFunctionBaseParams {
  config: {
    language?: string,
    transcriber: string,
    profileToken?: string,
    transcriberFallback?: string,
    profileTokenFallback?: string,
  };
}

const generateTranscriberSelect = (key: string, required: boolean, label: INodeFieldTranslations): INodeField => ({
  type: 'select',
  key,
  label,
  params: {
    required,
    options: [
      { value: 'GOOGLE', label: 'Google' },
      { value: 'MICROSOFT', label: 'Microsoft' },
      { value: 'IBM', label: 'IBM' },
    ]
  }
});

const generateProfileTokenInput = (key: string, label: INodeFieldTranslations, description: INodeFieldTranslations): INodeField => ({
  type: 'text',
  key,
  label,
  description,
  params: {
    required: false,
    placeholder: '',
  }
});

export const setSpeechtoTextServiceNode = createNodeDescriptor({
  type: 'speechToText',
  defaultLabel: t('speechToText.nodeLabel'),
  summary:  t('speechToText.nodeSummary'),
  appearance: {
    color: 'blue'
  },
  fields: [
    generateTranscriberSelect('transcriber', true, t('speechToText.inputServiceLabel')),
    generateProfileTokenInput('profileToken', t('speechToText.inputProfileTokenLabel'), t('speechToText.inputProfileTokenDescription')),
    generateTranscriberSelect('transcriberFallback', false, t('speechToText.inputServiceFallbackLabel')),
    generateProfileTokenInput('profileTokenFallback', t('speechToText.inputProfileTokenFallbackLabel'), t('speechToText.inputProfileTokenFallbackDescription')),
    {
      type: 'select',
      key: 'language',
      label: t('speechToText.inputLanguageLabel'),
      params: {
        required: true,
        options: [
          { value: 'en-US', label: 'en-US' },
          { value: 'de-DE', label: 'de-DE' },
        ]
      }
    }
  ],

  sections: [
    {
      key: 'selectMainSTT',
      fields: ['transcriber', 'profileToken'],
      label:  t('speechToText.sectionSelectSTTLabel'),
      defaultCollapsed: false,
    },
    {
      key: 'selectFallbackSTT',
      fields: ['transcriberFallback', 'profileTokenFallback'],
      label:  t('speechToText.sectionFallback'),
      defaultCollapsed: true,
    },
  ],
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
    }
  ],
  function: async ({ cognigy, config }: ISetSpeechToTextServiceParams) => {
    const { api } = cognigy;
    const transcriber = [];

    if (config.profileToken) {
      transcriber.push(`${config.transcriber}-${config.profileToken}`);
    } else {
      transcriber.push(config.transcriber);
    }

    if (config.transcriberFallback && config.profileTokenFallback) {
      transcriber.push(`${config.transcriberFallback}-${config.profileTokenFallback}`);
    } else if (config.transcriberFallback) {
      transcriber.push(`${config.transcriberFallback}`);
    }

    api.say('' , {
      status: 'transcription-switch',
      language: config.language,
      transcribers: transcriber,
    });
  },
});