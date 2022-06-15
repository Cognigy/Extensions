import { INodeField } from '@cognigy/extension-tools/build/interfaces/descriptor';
import { t } from '../helpers/translations';

export const promptFields: Array<INodeField> = [
  {
    type: 'cognigyText',
    key: 'text',
    label: t('shared.inputTextLabel'),
    description: t('shared.inputTextDescription'),
    params: {
      required: true,
    }
  },
  {
    type: 'number',
    key: 'timeout',
    label: t('shared.inputTimeoutLabel'),
    description: t('shared.inputTimeoutDescription'),
    params: {
      required: true
    }
  },
  {
    type: 'text',
    key: 'language',
    label: t('shared.inputLanguageLabel'),
    description: t('shared.inputLanguageDescription'),
  },
  {
    type: 'textArray',
    key: 'synthesizers',
    label: t('shared.inputSynthesizersLabel'),
    description: t('shared.inputSynthesizersDescription'),
  },
  {
    type: 'select',
    key: 'interpretAs',
    label: t('shared.inputInterpretAsLabel'),
    description: t('shared.inputInterpretAsDescription'),
    params: {
      options: [
        {
          value: 'SSML',
          label: 'SSML'
        },
        {
          value: 'TEXT',
          label: 'Text'
        }
      ]
    }
  },
  {
    type: 'checkbox',
    key: 'bargeIn',
    label: t('shared.inputBargeInLabel'),
    description: t('shared.inputBargeInDescription'),
    defaultValue: false,
  },
];

export const commonRedirectFields: Array<INodeField> = [
  {
    type: 'cognigyText',
    key: 'callerId',
    label: t('shared.inputCallerIdLabel'),
    description: t('shared.inputCallerIdDescription'),
    params: {
      placeholder: '+E.164 format, e.g. "+49721480848680"'
    }
  },
  {
    type: 'json',
    key: 'customSipHeaders',
    label: t('shared.inputCustomSipHeadersLabel'),
    description: t('shared.inputCustomSipHeadersDescription'),
  },
  {
    type: 'number',
    key: 'ringTimeout',
    label: t('shared.inputRingTimeoutLabel'),
    description: t('shared.inputRingTimeoutDescription'),
    defaultValue: 15,
    params: {
      placeholder: 'Value in Seconds, e.g. 60 for 1 minute',
      min: 10,
      max: 120
    },
  },
  {
    type: 'checkbox',
    key: 'acceptAnsweringMachines',
    label: t('shared.inputAcceptAnsweringMachinesLabel'),
    description: t('shared.inputAcceptAnsweringMachinesDescription'),
    defaultValue: false,
  },
  {
    type: 'json',
    key: 'data',
    label:  t('shared.inputDataLabel'),
    description: t('shared.inputDataDescription'),
  },
  {
    type: 'checkbox',
    key: 'endFlow',
    label: t('shared.inputEndFlowLabel'),
    defaultValue: false,
    description: t('shared.inputEndFlowDescription'),
  },
  {
    type: 'checkbox',
    key: 'experimentalEnableRingingTone',
    label: t('shared.inputExperimentalEnableRingingToneLabel'),
    description: t('shared.inputExperimentalEnableRingingToneDescription'),
    defaultValue: false,
  },
  {
    type: 'cognigyText',
    key: 'whisperingText',
    label: t('shared.inputWhisperingTextLabel'),
    description: t('shared.inputWhisperingTextDescription'),
  }
];
