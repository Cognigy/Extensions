import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { detectChannel } from "../helpers/channel-utils";


export interface IgetAdaptiveCardParams extends INodeFunctionBaseParams {
	config: {
        voiceMessage: string;
        cardCode: string;
        waitForInput: boolean;
    };
}

export const adaptiveCard = createNodeDescriptor({
    type: "niceAdaptiveCard",
    defaultLabel: "Show Adaptive Card",
    summary: "Sends an Adaptive Card to the user. Automatically formats output per channel. Optionally waits for the user to submit the card.",
    preview: {
        key: "cardCode",
        type: "text"
    },
    behavior: {
        stopping: true
    },
    fields: [
        {
            "key": "voiceMessage",
            "label": "Voice, SMS, WhatsApp Channel Announcement or Question",
            "type": "cognigyText",
            "description": "Fallback message to announce or ask in Voice/SMS/WhatsApp Channels.",
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
        },
        {
            "key": "waitForInput",
            "label": "Wait for Input",
            "type": "toggle",
            "description": "If enabled, the flow will pause after showing the card and wait for the user to submit it. Place a Capture Adaptive Card node after this one.",
            "defaultValue": false
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "voiceMessage" },
        { type: "field", key: "cardCode" },
        { type: "field", key: "waitForInput" }
    ],
    appearance: {
        color: "#445C98"
    },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { voiceMessage, cardCode, waitForInput } = rawConfig as IgetAdaptiveCardParams["config"];
        const { api, input, context } = cognigy;

        try {
            const { isVoice, isCognigy, isSms, isGuideChat } = detectChannel(input, context);
            api.log?.("info", `adaptiveCard: channel=${input?.channel}, flowChannel=${input?.data?.flowChannel || context?.data?.flowChannel} → isVoice:${isVoice} isCognigy:${isCognigy} isSms:${isSms} isGuideChat:${isGuideChat}`);

            let outBody: string;
            let outData = {};

            if (isVoice || isSms) {
                outBody = voiceMessage;
            } else {
                // Parse card only for digital channels
                const cardObj = typeof cardCode === "string"
                    ? JSON.parse(cardCode.trim())
                    : cardCode;

                if (isCognigy) {
                    outBody = '';
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
                } else {
                    outBody = '';
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
            }

            api.output?.(outBody, outData);
            api.log?.("info", `adaptiveCard: Outputed ${outBody} with data: ${JSON.stringify(outData)}.`);

            if (waitForInput) {
                api.log?.("info", "adaptiveCard: waiting for user input.");
                api.stopExecution?.();
            }
        } catch (error) {
            api.log?.("error", `adaptiveCard: Error outputing adaptive card; Error: ${(error as Error).message}.`);
            throw error;
        }
    }
});
