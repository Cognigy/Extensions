import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { t } from '../helpers/translations';

export interface ISetSpeechToTextServiceParams extends INodeFunctionBaseParams {
  config: {
    language?: string,
    transcribers: string,
    profileToken: string,
  };
}

export const setSpeechtoTextServiceNode = createNodeDescriptor({
  type: 'speechToText',
  defaultLabel: t('speechToText.nodeLabel'),
  summary:  t('speechToText.nodeSummary'),
  appearance: {
    color: 'blue'
  },
 
  fields: [
    {
      type: 'select',
      key: 'transcribers',
      label: t('speechToText.inputServiceLabel'),
      params: {
        required: true,
        options: [
          { value: 'GOOGLE', label: 'Google' },
          { value: 'MICROSOFT', label: 'Microsoft' },
          { value: 'IBM', label: 'IBM' },
        ]
      }
    },
    {
      type: 'text',
      key: 'profileToken',
      label: t('speechToText.inputProfileTokenLabel'),
      description: t('speechToText.inputProfileTokenDescription'),
      params: {
        required: false,
        placeholder: '',
      }
    },
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
      key: 'selectSTT',
      fields: ['transcribers', 'profileToken'],
      label:  t('speechToText.sectionSelectSTTLabel'),
      defaultCollapsed: false,
    },
    {
      key: 'selectLanguage',
      fields: ['language'],
      label:  t('speechToText.sectionSelectLanguageLabel'),
      defaultCollapsed: true,
    },
  ],
  form: [
    {
      key: 'selectSTT',
      type: 'section',
    },
    {
      key: 'selectLanguage',
      type: 'section',
    },
  ],
  function: async ({ cognigy, config }: ISetSpeechToTextServiceParams) => {
    const { api } = cognigy;
    const transcriber = [];

    if (config.profileToken) {
      transcriber.push(`${config.transcribers}-${config.profileToken}`);
    } else {
        transcriber.push(config.transcribers);
    }
  
    api.say("" , {
      status: 'transcription-switch',
      language: config.language,
      transcribers: transcriber,
    });
  },
});