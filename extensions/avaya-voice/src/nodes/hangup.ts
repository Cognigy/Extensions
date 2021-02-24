import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IHangupParams extends INodeFunctionBaseParams {}

export const hangupNode = createNodeDescriptor({
    type: "hangup",
    defaultLabel: "Hangup",
    fields: [],
    form: [],
    function: async({ cognigy } : IHangupParams) => {
        const { api } = cognigy;

        api.output('', {
            "_cognigy": {
                "_spoken": {
                    "json": {
                        "activities": [
                            {
                                "type": "event",
                                "name": "hangup",
                                "activityParams": {}
                            }                                         
                        ]
                    }
                }
            }
        });
    }
});
