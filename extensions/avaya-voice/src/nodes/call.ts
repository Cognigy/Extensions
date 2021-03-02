import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ICallParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            domain: string;
            accountSid: string;
            token: string;
        };
        callType: string;
    };
}

export const callNode = createNodeDescriptor({
    type: "call",
    defaultLabel: "Call",
    fields: [
        {
            key: "connection",
            label: "CPaaS Connection",
            type: "connection",
            params: {
                connectionType: "cpaas",
                required: true
            }
        },
        {
            key: "callType",
            label: "Type",
            type: "select",
            defaultValue: "makeCall",
            params: {
                options: [
                    {
                        label: "Make Call",
                        value: "makeCall"
                    },
                    {
                        label: "Record Call",
                        value: "recordCall"
                    },
                    {
                        label: "Interrupt Call",
                        value: "interruptCall"
                    },
                    {
                        label: "Play Audio to Call",
                        value: "playAudioToCall"
                    },
                    {
                        label: "Send Dtmf to Call",
                        value: "sendDtmfToCall"
                    }
                ]
            }
        }
    ],
    form: [
        {
            type: "field",
            key: "connection"
        },
        {
            type: "field",
            key: "callType"
        }
    ],
    function: async({ cognigy, config }: ICallParams) => {
        const { api } = cognigy;
        const { connection, callType } = config;
        const { domain, accountSid, token } = connection;
        api.output('', {
            "_cognigy": {
                "_spoken": {
                    "json": {
                        "activities": [{
                            "type": "event",
                            "name": "call",
                            "activityParams": {
                                callType,
                                connection
                            }
                        }]
                    }
                }
            }
        });
    }
});