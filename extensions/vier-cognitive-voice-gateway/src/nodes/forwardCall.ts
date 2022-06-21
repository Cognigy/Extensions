import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import { bakeData, bakeSipHeaders } from '../helpers/bake';
import { stripEmpty } from '../helpers/stripEmpty';
import { t } from '../helpers/translations';
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
  defaultLabel: t('forward.nodeLabel'),
  summary: t('forward.nodeSummary'),
  appearance: {
    color: 'blue',
  },
  behavior: {
    entrypoint: true,
  },
  dependencies: {
    children: [
      'onForwardSuccess',
      'onForwardFailure',
      'onForwardTermination',
      'onForwardDefault',
    ],
  },
  tags: ['service'],
  fields: [
    {
      type: 'cognigyText',
      key: 'destinationNumber',
      label: t('forward.inputDestinationNumberLabel'),
      description: t('forward.inputDestinationNumberDescription'),
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

  function: async ({ cognigy, config, childConfigs, nodeId }: IForwardCallParams) => {
    const { api } = cognigy;
    let customSipHeaders: object;
    let data: object;

    const onFailureChild = childConfigs.find(
      (child) => child.type === 'onForwardFailure'
    );
    const onSuccessChild = childConfigs.find(
      (child) => child.type === 'onForwardSuccess'
    );
    const onTerminateChild = childConfigs.find(
      (child) => child.type === 'onForwardTermination'
    );
    const onDefaultChild = childConfigs.find(
      (child) => child.type === 'onForwardDefault'
    );
    api.setNextNode(onFailureChild.id);

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
    // Check if the Child Node exists
    if (!onSuccessChild) {
      throw new Error(
        'Unable to find \'onSuccessChild\'. Seems its not attached.'
      );
    }

    if (!onFailureChild) {
      throw new Error(
        'Unable to find \'onFailureChild\'. Seems its not attached.'
      );
    }

    if (!onDefaultChild) {
      throw new Error(
        'Unable to find \'onDefaultChild\'. Seems its not attached.'
      );
    }

    if (!onTerminateChild) {
      throw new Error(
        'Unable to find \'onTerminateChild\'. Seems its not attached.'
      );
    }

    if (responseData) {
      api.setNextNode(onSuccessChild.id);
    } else {
      api.setNextNode(onFailureChild.id);
    }

    if (responseData && !onSuccessChild) {
      api.setNextNode(onDefaultChild.id);
    }

    api.say('', responseData);

    /*
      Example data
      cognigy.input.data = {
        "status": "outbound-failure" | "outbound-success", 
        "dialogId": "78ed3949-f224-4662-8480-b8a92fdd0ee2",
        "projectContext": {
          "projectToken": "315e0c5b-0ee3-4fbf-85be-b9c86616ea86",
          "resellerToken": "ff5df9cd-c0dc-41ef-abbe-2d0f4ff5c036"
        },
        "timestamp": "2022-06-21T07:47:56.272Z",
        "ringTime": 0,
        "ringStartTimestamp": null,
        "reason": "ALREADY_BRIDGED",
        "message": "The call has already been bridged.",
      }
    */
    // cognigy.api.setNextNode(nodeId);
    if (config.endFlow) {
      api.stopExecution();
      api.setNextNode(onTerminateChild.id);
    }
  },
});

export const onForwardSuccess = createNodeDescriptor({
  type: 'onForwardSuccess',
  parentType: 'forward',
  defaultLabel: 'On Success',
  constraints: {
    editable: false,
    deletable: false,
    creatable: false,
    movable: false,
    placement: {
      predecessor: {
        whitelist: [],
      },
    },
  },
  appearance: {
    color: '#61d188',
    textColor: 'white',
    variant: 'mini',
  },
});

export const onForwardFailure = createNodeDescriptor({
  type: 'onForwardFailure',
  parentType: 'forward',
  defaultLabel: 'On Failure',
  constraints: {
    editable: false,
    deletable: false,
    creatable: false,
    movable: false,
    placement: {
      predecessor: {
        whitelist: [],
      },
    },
  },
  appearance: {
    color: '#61d188',
    textColor: 'white',
    variant: 'mini',
  },
});

export const onForwardTermination = createNodeDescriptor({
  type: 'onForwardTermination',
  parentType: 'forward',
  defaultLabel: 'On Termination',
  constraints: {
    editable: false,
    deletable: false,
    creatable: false,
    movable: false,
    placement: {
      predecessor: {
        whitelist: [],
      },
    },
  },
  appearance: {
    color: '#61d188',
    textColor: 'white',
    variant: 'mini',
  },
});

export const onForwardDefault = createNodeDescriptor({
  type: 'onForwardDefault',
  parentType: 'forward',
  defaultLabel: 'Default',
  constraints: {
    editable: false,
    deletable: false,
    creatable: false,
    movable: false,
    placement: {
      predecessor: {
        whitelist: [],
      },
    },
  },
  appearance: {
    color: '#61d188',
    textColor: 'white',
    variant: 'mini',
  },
});
