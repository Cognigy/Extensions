import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ILivePersonHandoverParams extends INodeFunctionBaseParams {
    config: {
        skillName: string;
    };
}

export const handovertoAgentNode = createNodeDescriptor({
    type: "handover",
    summary: {
        default: "Starts a conversation with a LivePerson agent",
        deDE: "Startet eine Konversation mit einem LivePerson Agenten"
    },
    defaultLabel: {
        default: "Handover to Agent",
        deDE: "Transfer zu Agenten"
    },
    fields: [
        {
            key: "skillName",
            label: "Skill Name",
            type: "cognigyText",
            description: {
				default: "The target skill that the agent should have.",
				deDE: "Der Zielskill, den der Agent haben soll."
			},
            defaultValue: "Handover",
            params: {
                required: true
            }
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "skillName" }
    ],
    appearance: {
        color: "orange"
    },
    function: async ({ cognigy, config }: ILivePersonHandoverParams) => {
        const { api, input } = cognigy;
        const { skillName } = config;

        api.say("",
            {
                "lp_response": {
                    "response": [
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