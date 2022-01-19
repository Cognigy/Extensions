import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { bakeData, bakeSipHeaders } from '../helpers/bake';
import { stripEmpty } from '../helpers/stripEmpty';
import { commonRedirectFields } from './shared';

export interface IBridgeCallParams extends INodeFunctionBaseParams {
  config: {
    headNumber: string,
    extensionLength: number,
    callerId?: string,
    customSipHeaders?: object,
    ringTimeout?: number,
    acceptAnsweringMachines?: boolean,
    data?: object,
    experimentalEnableRingingTone?: boolean,
    endFlow?: boolean,
    whisperingText?: string
  };
}

export const bridgeCallNode = createNodeDescriptor({
  type: 'bridge',
  defaultLabel: 'Bridge Call',
  summary: 'Bridge the call to a different destination for agent assistance',
  appearance: {
    color: 'green'
  },
  tags: ['service'],
  fields: [
    {
      type: 'cognigyText',
      key: 'headNumber',
      label: 'Head Number',
      description: 'The phone number prefix to bridge to',
      params: {
        required: true,
        placeholder: '+E.164 format, e.g. "+49721480848680"'
      }
    },
    {
      type: 'number',
      key: 'extensionLength',
      label: 'Extension Length',
      description: 'The range of extensions to choose a number from',
      params: {
        required: true,
        min: 0,
        max: 5,
      },
    },
    ...commonRedirectFields,
  ],
  sections: [
    {
      key: 'general',
      fields: ['headNumber', 'extensionLength'],
      label: 'General Settings',
      defaultCollapsed: false,
    },
    {
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
  function: async ({ cognigy, config }: IBridgeCallParams) => {
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
      status: 'bridge',
      ...strippedConfig,
      customSipHeaders,
      data,
    };

    if (whisperText) {
      responseData = {
        ...responseData,
        whispering: {
          text: whisperText,
        }
      };
    }

    api.say('', responseData);

    if (config.endFlow) {
      api.stopExecution();
    }
  }
});
