import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ILivePersonHandoverParams extends INodeFunctionBaseParams {
    config: {
        handoverAcceptMessage: string;
        errorMessage: string;
        skillName: string;
    };
}

export const handovertoAgentNode = createNodeDescriptor({
    type: "handover",
    summary: "Starts a conversation with a LivePerson human agent",
    defaultLabel: "Handover to Agent",
    fields: [
        {
            key: "handoverAcceptMessage",
            label: "Handover Accept Message",
            type: "cognigyText",
            description: "The message to display to the user once the handover request was accepted by the live chat",
            params: {
                required: true
            }
        },
        {
            key: "errorMessage",
            label: "Error Message",
            type: "cognigyText",
            defaultValue: "Sorry but I could not forward you to a human agent.",
            params: {
                required: true
            }
        },
        {
            key: "skillName",
            label: "Skill Name",
            type: "cognigyText",
            description: "The message that should be displayed to the user if the handover failed.",
            defaultValue: "Handover",
            params: {
                required: true
            }
        }
    ],
    sections: [
        {
            key: "storageOption",
            label: "Storage Options",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "handoverAcceptMessage" },
        { type: "field", key: "skillName" },
        { type: "field", key: "errorMessage" }
    ],
    appearance: {
        color: "orange"
    },
    function: async ({ cognigy, config }: ILivePersonHandoverParams) => {
        const { api, input } = cognigy;
        const { handoverAcceptMessage, errorMessage, skillName } = config;

        api.say(handoverAcceptMessage);

        api.say("",
            {
                "lp_response": {
                    "response": [
                        {
                            "type": "TEXT",
                            "data": {
                                "message": errorMessage
                            }
                        },
                        {
                            "type": "ACTION",
                            "data": {
                                "name": "TRANSFER",
                                "parameters": {
                                    "skillName": skillName
                                }
                            }
                        }
                    ],
                    "analytics": {
                        "intents": [
                            {
                                "id": "base-transfer",
                                "description": "Custom Transfer",
                                "confidenceScore": input.intentScore
                            }
                        ]
                    }
                }
            }
        );
    }
});