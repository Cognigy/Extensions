import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { bakeData, bakeSipHeaders } from '../helpers/bake';
import { stripEmpty } from '../helpers/stripEmpty';
import { t } from '../helpers/translations';
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
  defaultLabel: t('bridge.nodeLabel'),
  summary: t('bridge.nodeSummary'),
  appearance: {
    color: 'green'
  },
  tags: ['service'],
  fields: [
    {
      type: 'cognigyText',
      key: 'headNumber',
      label: t('bridge.inputHeadNumberLabel'),
      description: t('bridge.inputHeadNumberDescription'),
      params: {
        required: true,
        placeholder: '+E.164 format, e.g. "+49721480848680"'
      }
    },
    {
      type: 'number',
      key: 'extensionLength',
      label: t('bridge.inputExtensionLengthLabel'),
      description: t('bridge.inputExtensionLengthDescription'),
      params: {
        required: true,
        min: 0,
        max: 5,
      },
    },
    ...commonRedirectFields,
  ],
  preview: {
		key: "headNumber",
		type: "text"
	},
  sections: [
    {
      key: 'general',
      fields: ['headNumber', 'extensionLength'],
      label: t('forward.sectionGeneralLabel'),
      defaultCollapsed: false,
    },
    {
      key: 'call',
      fields: ['callerId', 'ringTimeout', 'acceptAnsweringMachines'],
      label: t('forward.sectionCallLabel'),
      defaultCollapsed: true,
    },
    {
      key: 'sipHeaders',
      fields: ['customSipHeaders'],
      label: t('forward.sectionSipHeadersLabel'),
      defaultCollapsed: true,
    },
    {
      key: 'additionalData',
      fields: ['data'],
      label: t('forward.sectionAdditionalDataLabel'),
      defaultCollapsed: true,
    },
    {
      key: 'additionalSettings',
      fields: ['whisperingText', 'endFlow', 'experimentalEnableRingingTone'],
      label: t('forward.sectionAdditionalSettingsLabel'),
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
