import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import {
  INodeField,
  INodeFieldTranslations,
} from '@cognigy/extension-tools/build/interfaces/descriptor';
import t from '../translations';
import { languageSelectField } from "./shared";

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
    languageSelectField('language', true, t.speechToText.inputLanguageLabel),
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