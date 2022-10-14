import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import {
  normalizeData,
  normalizeSipHeaders,
  convertWhisperText,
  normalizeText,
  convertDuration, delay
} from '../helpers/util';
import t from '../translations';
import { commonRedirectFields } from './shared';

export interface IForwardCallParams extends INodeFunctionBaseParams {
  config: {
    destinationNumber: string;
    callerId?: string;
    customSipHeaders?: object;
    ringTimeout?: number;
    acceptAnsweringMachines?: boolean;
    data?: object;
    experimentalEnableRingingTone?: boolean;
    endFlow?: boolean;
    whisperingText?: string;
  };
}

export const forwardCallNode = createNodeDescriptor({
  type: 'forward',
  defaultLabel: t.forward.nodeLabel,
  summary: t.forward.nodeSummary,
  appearance: {
    color: 'blue',
  },

  tags: ['service'],
  fields: [
    {
      type: 'cognigyText',
      key: 'destinationNumber',
      label: t.forward.inputDestinationNumberLabel,
      description: t.forward.inputDestinationNumberDescription,
      params: {
        required: true,
      },
    },
    ...commonRedirectFields,
  ],

  preview: {
    key: 'destinationNumber',
    type: 'text',
  },

  sections: [
    {
      key: 'general',
      fields: ['destinationNumber'],
      label: t.forward.sectionGeneralLabel,
      defaultCollapsed: false,
    },
    {
      key: 'call',
      fields: ['callerId', 'ringTimeout', 'acceptAnsweringMachines'],
      label: t.forward.sectionCallLabel,
      defaultCollapsed: true,
    },
    {
      key: 'sipHeaders',
      fields: ['customSipHeaders'],
      label: t.shared.inputCustomSipHeadersLabel,
      defaultCollapsed: true,
    },
    {
      key: 'additionalData',
      fields: ['data'],
      label: t.forward.sectionAdditionalDataLabel,
      defaultCollapsed: true,
    },
    {
      key: 'additionalSettings',
      fields: ['whisperingText', 'endFlow', 'experimentalEnableRingingTone'],
      label: t.forward.sectionAdditionalSettingsLabel,
      defaultCollapsed: true,
    },
  ],
  form: [
    {
      key: 'general',
      type: 'section',
    },
    {
      key: 'call',
      type: 'section',
    },
    {
      key: 'sipHeaders',
      type: 'section',
    },
    {
      key: 'additionalData',
      type: 'section',
    },
    {
      key: 'additionalSettings',
      type: 'section',
    },
  ],

  function: async ({ cognigy, config }: IForwardCallParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'forward',
      destinationNumber: normalizeText(config.destinationNumber),
      callerId: normalizeText(config.callerId),
      customSipHeaders: normalizeSipHeaders(config.customSipHeaders),
      ringTimeout: convertDuration(config.ringTimeout),
      acceptAnsweringMachines: config.acceptAnsweringMachines,
      data: normalizeData(config.data),
      whispering: convertWhisperText(config.whisperingText),
    };

    return delay(100, () => {
      api.say('', payload);
      if (config.endFlow) {
        api.stopExecution();
      }
    });
  },
});
