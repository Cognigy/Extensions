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
  behavior: {
    entrypoint: true
    },
  dependencies: {
    children: [
        "onBridgeSuccess",
        "onBridgeFailure",
        "onBridgeTermination",
    ]
},
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
  function: async ({ cognigy, config, childConfigs }: IBridgeCallParams) => {
    const { api } = cognigy;
    let customSipHeaders: object;
    let data: object;

    const onFailureChild = childConfigs.find(child => child.type === "onBridgeFailure");
    const onSuccessChild = childConfigs.find(child => child.type === "onBridgeSuccess");
    const onTerminateChild = childConfigs.find(child => child.type === "onBridgeTermination")

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
      data
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

    if (responseData) {
      api.setNextNode(onSuccessChild.id);
  } else {
      api.setNextNode(onFailureChild.id);
      }   

    if (config.endFlow) {
      api.stopExecution();
      api.setNextNode(onTerminateChild.id);
    }
  }
});

export const onBridgeSuccess = createNodeDescriptor({
  type: "onBridgeSuccess",
  parentType: "bridge",
  defaultLabel: "On Success",
  constraints: {
      editable: false,
      deletable: false,
      creatable: false,
      movable: false,
      placement: {
          predecessor: {
              whitelist: []
          }
      }
  },
  appearance: {
      color: "#61d188",
      textColor: "white",
      variant: "mini"
  }
  });

export const onBridgeFailure = createNodeDescriptor({
  type: "onBridgeFailure",
  parentType: "bridge",
  defaultLabel: "On Failure",
  constraints: {
      editable: false,
      deletable: false,
      creatable: false,
      movable: false,
      placement: {
          predecessor: {
              whitelist: []
          }
      }
  },
  appearance: {
      color: "#61d188",
      textColor: "white",
      variant: "mini"
  }
});

export const onBridgeTermination = createNodeDescriptor({
  type: "onBridgeTermination",
  parentType: "bridge",
  defaultLabel: "On Termination",
  constraints: {
      editable: false,
      deletable: false,
      creatable: false,
      movable: false,
      placement: {
          predecessor: {
              whitelist: []
          }
      }
  },
  appearance: {
      color: "#61d188",
      textColor: "white",
      variant: "mini"
  }
});
