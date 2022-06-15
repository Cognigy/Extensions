import { t } from '../helpers/translations';
import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';
import { commonRedirectFields } from './shared';

export interface ICheckForwardResultParams extends INodeFunctionBaseParams {
    config: {
        data?: object,
        endFlow?: boolean,
    };
}

    export const forwardCallServiceNode = createNodeDescriptor({
    type: 'forwardService',
    defaultLabel: t('forwardService.nodeLabel'),
    summary:  t('forwardService.nodeSummary'),
    appearance: {
    color: 'blue'
    },
behavior: {
entrypoint: true
},

dependencies: {
    children: [
        "onForwardSuccess",
        "onForwardFailure",
        "onForwardTermination",
        "onForwardDefault",
    ]
},

function: async ({ cognigy, config, childConfigs }: ICheckForwardResultParams) => {
    const { api } = cognigy;

    const onFailureChild = childConfigs.find(child => child.type === "onForwardFailure");
    const onSuccessChild = childConfigs.find(child => child.type === "onForwardSuccess");
    const onTerminateChild = childConfigs.find(child => child.type === "onForwardTermination");
    const onDefaultChild = childConfigs.find(child => child.type === "onForwardDefault");
    
    let responseData: object = {
        status: 'forwardService',
        childConfigs,
        
    };
        // Check if the Child Node exists         
        if (!onSuccessChild) {
            throw new Error("Unable to find 'onSuccessChild'. Seems its not attached.");
            }
        
        if (!onFailureChild) {
                throw new Error("Unable to find 'onFailureChild'. Seems its not attached.");
            }

        if (!onDefaultChild) {
            throw new Error("Unable to find 'onDefaultChild'. Seems its not attached.");
        }

        if (!onTerminateChild) {
            throw new Error("Unable to find 'onTerminateChild'. Seems its not attached.");
        }
    
        if (config.endFlow) {
            api.stopExecution();
            api.setNextNode(onTerminateChild.id);
            }

        if (responseData) {
            api.setNextNode(onSuccessChild.id);
        } else {
            api.setNextNode(onFailureChild.id);
            }
        }   
    });

    export const onForwardSuccess = createNodeDescriptor({
    type: "onForwardSuccess",
    parentType: "forwardService",
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

export const onForwardFailure = createNodeDescriptor({
    type: "onForwardFailure",
    parentType: "forwardService",
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

export const onForwardTermination = createNodeDescriptor({
    type: "onForwardTermination",
    parentType: "forwardService",
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

export const onForwardDefault = createNodeDescriptor({
    type: "onForwardDefault",
    parentType: "forwardService",
    defaultLabel: "Default",
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

