import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface IgetAdaptiveCardParams extends INodeFunctionBaseParams {
	config: {
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
        { type: "field", key: "voiceMessage" },
        { type: "field", key: "cardCode" }
    ],
    appearance: {
        color: "#3694fd"
    },
    function: async ({ cognigy, config }: IgetAdaptiveCardParams) => {
        const { voiceMessage, cardCode } = config;
        const { api, input, context } = cognigy;

        interface IAdaptiveCard {
            $schema?: string;
            type: string;
            version: string;
            body: any[];
            actions?: any[];
        }

        try {
            const oChannel = input?.channel || '';
            api.log("info", `adaptiveCard: Interaction channel: ${oChannel}`);

            const lc = oChannel.toLowerCase().trim();

            // Voice check
            const isVoice = lc.includes("voice");
            // Cognigy channel check
            const isCognigy =
                lc.includes("adminconsole") ||
                lc.includes("webchat") ||
                lc.includes("test");
            // Otherwise it is Guide Chat
            const isGuideChat = !isVoice && !isCognigy;
            api.log("info", `adaptiveCard: isVoice: ${isVoice}, isCognigy: ${isCognigy}, isGuideChat: ${isGuideChat}`);

            let outBody: string;
            let cardObj: IAdaptiveCard;
            if (typeof cardCode === "string") {
                cardObj = JSON.parse(cardCode.trim());
            } else {
                cardObj = cardCode;
            }

            let outData = {};
            outBody = null;
            if (isVoice) {
               outBody = voiceMessage;
            } else if (isCognigy) { // Cognigy Webchat
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