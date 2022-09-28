import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import {
  convertRingTimeout,
  convertWhisperText,
  normalizeData,
  normalizeSipHeaders,
  normalizeText
} from '../helpers/bake';
import t from '../translations';
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
  defaultLabel: t.bridge.nodeLabel,
  summary: t.bridge.nodeSummary,
  appearance: {
    color: 'green'
  },
  tags: ['service'],
  behavior: {
    entrypoint: true
  },
  fields: [
    {
      type: 'cognigyText',
      key: 'headNumber',
      label: t.bridge.inputHeadNumberLabel,
      description: t.bridge.inputHeadNumberDescription,
      params: {
        required: true,
        placeholder: '+E.164 format, e.g. "+49721480848680"'
      }
    },
    {
      type: 'number',
      key: 'extensionLength',
      label: t.bridge.inputExtensionLengthLabel,
      description: t.bridge.inputExtensionLengthDescription,
      params: {
        required: true,
        min: 0,
        max: 5,
      },
    },
    ...commonRedirectFields,
  ],
  preview: {
    key: 'headNumber',
    type: 'text'
  },
  sections: [
    {
      key: 'general',
      fields: ['headNumber', 'extensionLength'],
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
  function: async ({ cognigy, config, childConfigs }: IBridgeCallParams) => {
    const { api } = cognigy;

    const payload = {
      status: 'bridge',
      headNumber: normalizeText(config.headNumber),
      extensionLength: config.extensionLength,
      callerId: normalizeText(config.callerId),
      customSipHeaders: normalizeSipHeaders(config.customSipHeaders),
      ringTimeout: convertRingTimeout(config.ringTimeout),
      acceptAnsweringMachines: config.acceptAnsweringMachines,
      data: normalizeData(config.data),
      whispering: convertWhisperText(config.whisperingText),
    };

    api.say('', payload);

    if (config.endFlow) {
      api.stopExecution();
    }
  }
});
