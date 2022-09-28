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
  tags: ['logic'],
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

    function childByType(type: string) {
      const child = childConfigs.find((child) => child.type === type);
      if (!child) {
        throw new Error(`Unable to find '${child}'. Seems its not attached.`);
      }
      return child;
    }

    const onFailureChild = childByType('onOutboundFailure');
    const onSuccessChild = childByType('onOutboundSuccess');
    const onTerminateChild = childByType('onOutboundTermination');
    const onDefaultChild = childByType('onOutboundDefault');

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
  defaultLabel: t.shared.childSuccessLabel,
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
  defaultLabel: t.shared.childFailureLabel,
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
  defaultLabel: t.shared.childTerminationLabel,
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
  defaultLabel: t.shared.childDefaultLabel,
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
