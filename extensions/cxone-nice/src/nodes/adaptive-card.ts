import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface IgetAdaptiveCardParams extends INodeFunctionBaseParams {
	config: {
        channel: string;
        voiceMessage: string;
        cardCode: string;
    };
}

export const adaptiveCard = createNodeDescriptor({
    type: "niceAdaptiveCard",
    defaultLabel: "Adaptive Card",
    summary: "Shows Adaptive Card in digital channels",
    preview: {
        key: "cardCode",
        type: "text"
    },
    fields: [
        {
            "key": "channel",
            "label": "Interaction Channel",
            "type": "cognigyText",
            "description": "Interaction Channel",
            "params": {
                "required": true
            },
            "defaultValue": "{{context.data.flowChannel}}"
        },
        {
            "key": "voiceMessage",
            "label": "Voice Channel Announcement",
            "type": "cognigyText",
            "description": "Fallback message to announce in the Voice Channel.",
            "params": {
                "required": true
            },
            "defaultValue": ""
        },
        {
            "key": "cardCode",
            "label": "Adaptive Card Code",
            "type": "json",
            "description": "The JSON code defining the Adaptive Card.",
            "params": {
                "required": true
            },
            "defaultValue": `{
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.5",
    "body": [],
    "actions": []
}`
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "channel" },
        { type: "field", key: "voiceMessage" },
        { type: "field", key: "cardCode" }
    ],
    appearance: {
        color: "#3694fd"
    },
    function: async ({ cognigy, config }: IgetAdaptiveCardParams) => {
        const { channel, voiceMessage, cardCode } = config;
        const { api, input, context } = cognigy;
        api.log("info", `adaptiveCard: Initizalized.`);

        interface IAdaptiveCard {
            $schema?: string;
            type: string;
            version: string;
            body: any[];
            actions?: any[];
        }

        try {
            const lChannel = channel.toLowerCase().trim();
            api.log("info", `adaptiveCard: Channel detected: ${lChannel}.`);
            let outBody: string;
            let cardObj: IAdaptiveCard;
            if (typeof cardCode === "string") {
                cardObj = JSON.parse(cardCode.trim());
            } else {
                cardObj = cardCode;
            }

            let outData = {};
            outBody = null;
            if (lChannel.includes("voice")) {
               outBody = voiceMessage;
            } else if (lChannel.includes("test") || lChannel.includes("web")) { // Cognigy Webchat
                outData = {
                    "type": "adaptiveCard",
                    "_cognigy": {
                        "_default": {
                            "_adaptiveCard": {
                                "type": "adaptiveCard",
                                "adaptiveCard": cardObj
                            }
                        }
                    }
                };
            } else { // NiCE channel for Guide Chat
                outData = {
                    _cognigy: {
                        _niceCXOne: {
                            json: {
                                text: "",
                                uiComponent: {
                                    type: cardObj.type,
                                    version: cardObj.version,
                                    body: cardObj.body,
                                    actions: cardObj.actions
                                },
                                data: {},
                                action: "ADAPTIVE_CARD"
                            }
                        }
                    }
                };
            }
            api.output(outBody, outData);
            api.log("info", `adaptiveCard: Outputed ${outBody} with data: ${JSON.stringify(outData)}.`);
        } catch (error) {
            api.log("error", `adaptiveCard: Error outputing adaptive card; Error: ${error.message}.`);
            throw error;
        }
    }
});