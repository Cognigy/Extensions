import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';

export const checkOutboundResultNode = createNodeDescriptor({
  type: 'outboundService',
  defaultLabel: t.outboundService.nodeLabel,
  summary: t.outboundService.nodeSummary,
  appearance: {
    color: 'blue',
  },
  behavior: {
    entrypoint: true,
  },
  dependencies: {
    children: [
      'onOutboundSuccess',
      'onOutboundFailure',
      'onOutboundTermination',
      'onOutboundDefault',
    ],
  },

  function: async ({ cognigy, childConfigs }: INodeFunctionBaseParams) => {
    const { api } = cognigy;

    const onFailureChild = childConfigs.find(
      (child) => child.type === 'onOutboundFailure'
    );
    const onSuccessChild = childConfigs.find(
      (child) => child.type === 'onOutboundSuccess'
    );
    const onTerminateChild = childConfigs.find(
      (child) => child.type === 'onOutboundTermination'
    );
    const onDefaultChild = childConfigs.find(
      (child) => child.type === 'onOutboundDefault'
    );

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

    if (cognigy.input.data.status === 'outbound-success') {
      api.setNextNode(onSuccessChild.id);
    } else if (cognigy.input.data.status === 'outbound-failure') {
      api.setNextNode(onFailureChild.id);
    } else if (cognigy.input.data.status === 'termination') {
      api.setNextNode(onTerminateChild.id);
    } else {
      api.setNextNode(onDefaultChild.id);
    }
  },
});

export const onOutboundSuccess = createNodeDescriptor({
  type: 'onOutboundSuccess',
  parentType: 'outbound',
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

export const onOutboundFailure = createNodeDescriptor({
  type: 'onOutboundFailure',
  parentType: 'outbound',
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

export const onOutboundTermination = createNodeDescriptor({
  type: 'onOutboundTermination',
  parentType: 'outbound',
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

export const onOutboundDefault = createNodeDescriptor({
  type: 'onOutboundDefault',
  parentType: 'outbound',
  defaultLabel: 'Default',
  constraints: {
    editable: false,
    deletable: true,
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
