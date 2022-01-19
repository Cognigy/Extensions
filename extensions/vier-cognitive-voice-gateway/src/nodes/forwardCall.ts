import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { bakeData, bakeSipHeaders } from '../helpers/bake';
import { stripEmpty } from '../helpers/stripEmpty';
import { commonRedirectFields } from './shared';

export interface IForwardCallParams extends INodeFunctionBaseParams {
  config: {
    destinationNumber: string,
    callerId?: string,
    customSipHeaders?: object,
    ringTimeout?: number,
    acceptAnsweringMachines?: boolean,
    data?: object,
    experimentalEnableRingingTone?: boolean,
    endFlow?: boolean,
    whisperingText?: string,
  };
}

export const forwardCallNode = createNodeDescriptor({
  type: 'forward',
  defaultLabel: 'Forward Call',
  summary: 'Forward the call to a different destination',
  appearance: {
    color: 'blue'
  },
  tags: ['service'],
  fields: [
    {
      type: 'cognigyText',
      key: 'destinationNumber',
      label: 'Destination Number',
      description: 'The phone number to forward to (+E.164 format, e.g. +49721480848680)',
      params: {
        required: true
      }
    },
    ...commonRedirectFields,
  ],
  sections: [
    {
      key: 'general',
      fields: ['destinationNumber'],
      label: 'General Settings',
      defaultCollapsed: false,
    },{
      key: 'call',
      fields: ['callerId', 'ringTimeout', 'acceptAnsweringMachines'],
      label: 'Call Settings',
      defaultCollapsed: true,
    },
    {
      key: 'sipHeaders',
      fields: ['customSipHeaders'],
      label: 'Custom SIP Headers',
      defaultCollapsed: true,
    },
    {
      key: 'additionalData',
      fields: ['data'],
      label: 'Data',
      defaultCollapsed: true,
    },
    {
      key: 'additionalSettings',
      fields: ['whisperingText', 'endFlow', 'experimentalEnableRingingTone'],
      label: 'Additional Settings',
      defaultCollapsed: true,
    }
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
    }
  ],
  function: async ({ cognigy, config }: IForwardCallParams) => {
    const { api } = cognigy;
    let customSipHeaders: object;
    let data: object;

    const whisperText = config.whisperingText;
    delete config.whisperingText;

    if (config.customSipHeaders) {
      customSipHeaders = bakeSipHeaders(config.customSipHeaders);
    }

    if (config.data) {
      data = bakeData(config.data);
    }

    if (config.ringTimeout) {
      config.ringTimeout = config.ringTimeout * 1000;
    }

    const strippedConfig = stripEmpty(config);

    let responseData: object = {
      status: 'forward',
      ...strippedConfig,
      customSipHeaders,
      data,
    };

    if (whisperText) {
      responseData = {
        ...responseData,
        whispering: {
          text: whisperText,
        },
      };
    }

    api.say('', responseData);

    if (config.endFlow) {
      api.stopExecution();
    }
  },
});