import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import { t } from '../helpers/translations';

export const checkForwardResultNode = createNodeDescriptor({
  type: 'forwardService',
  defaultLabel: t('forwardService.nodeLabel'),
  summary: t('forwardService.nodeSummary'),
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

  function: async ({ cognigy, childConfigs }: INodeFunctionBaseParams) => {
    const { api } = cognigy;

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
