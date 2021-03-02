import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { compileParams, getParameterFields, getParamSections } from "../utils/paramUtils";
import { nodeColor } from '../utils/design';

export interface ISendMessageRequestParams extends INodeFunctionBaseParams {
	config: {
		text: string;
        activityParams: any;
        setActivityParams: boolean;
        azureSpeechRecognitionMode: string;
		bargeIn: boolean;
		bargeInOnDTMF: boolean;
		bargeInMinWordCount: number;
		botFailOnErrors: boolean;
		botNoInputGiveUpTimeoutMS: number;
		botNoInputTimeoutMS: number;
		botNoInputRetries: number;
		botNoInputSpeech: string;
		botNoInputUrl: string;
		userNoInputTimeoutMS: number;
		userNoInputRetries: number;
		userNoInputSendEvent: boolean;
		userNoInputSpeech: string;
		userNoInputUrl: string;
		continuousASR: boolean;
		continuousASRDigits: string;
		continuousASRTimeoutInMS: number;
		disableTtsCache: boolean;
		googleInteractionType: string;
		language: string;
		sendDTMF: boolean;
		dtmfCollect: boolean;
		dtmfCollectInterDigitTimeoutMS: number;
		dtmfCollectMaxDigits: number;
		dtmfCollectSubmitDigit: string;
		sttContextId: string;
		sttContextPhrases: string[];
		sttContextBoost: number;
		sttDisablePunctuation: boolean;
		azureEnableAudioLogging: boolean;
		voiceName: string;
    };
}

export const sendMessageNode = createNodeDescriptor({
	type: "sendMessage",
    defaultLabel: "Send Message",
    summary: "Sends a prompt via VG",
    // @ts-ignore
	fields: [
		{
			key: "text",
			label: "Text",
            type: "cognigyText",
            params: {
                required: true,
                ssmlOptions: [
                    {
                        label: "audio",
                        prefix: '<audio src=""/>',
                    },
                    {
                        label: "emphasize",
                        buttons: [
                            {
                                label: "strong",
                                prefix: '<emphasis level="strong">',
                                suffix: "</emphasis> ",
                            },
                            {
                                label: "moderate",
                                prefix: '<emphasis level="moderate">',
                                suffix: "</emphasis> ",
                            },
                            {
                                label: "reduced",
                                prefix: '<emphasis level="reduced">',
                                suffix: "</emphasis> ",
                            },
                        ],
                    },
                    {
                        label: "pause",
                        buttons: [
                            {
                                label: "medium pause",
                                prefix: '<break strength="medium"/>',
                            },
                            {
                                label: "strong pause",
                                prefix: '<break strength="strong"/>',
                            },
                            {
                                label: "extra strong pause",
                                prefix: '<break strength="x-strong"/>',
                            },
                            {
                                label: "no pause",
                                prefix: '<break strength="none"/>',
                            },
                            {
                                label: "1.5 seconds pause",
                                prefix: '<break time="1500ms"/>',
                            },
                            {
                                label: "3 seconds pause",
                                prefix: '<break time="3s"/>',
                            },
                        ],
                    },
                    {
                        label: "structure",
                        buttons: [
                            {
                                label: "paragraph",
                                prefix: "<p>",
                                suffix: "</p>",
                            },
                            {
                                label: "sentence",
                                prefix: "<s>",
                                suffix: "</s>",
                            },
                        ],
                    },
                    {
                        label: "say as",
                        buttons: [
                            {
                                label: "verbatim",
                                prefix: '<say-as interpret-as="verbatim">',
                                suffix: "</say-as>",
                            },
                            {
                                label: "cardinal",
                                prefix: '<say-as interpret-as="cardinal">',
                                suffix: "</say-as>",
                            },
                            {
                                label: "ordinal",
                                prefix: '<say-as interpret-as="ordinal">',
                                suffix: "</say-as>",
                            },
                            {
                                label: "characters",
                                prefix: '<say-as interpret-as="characters">',
                                suffix: "</say-as>",
                            },
                            {
                                label: "fraction",
                                prefix: '<say-as interpret-as="fraction">',
                                suffix: "</say-as>",
                            },
                            {
                                label: "unit",
                                prefix: '<say-as interpret-as="unit">',
                                suffix: "</say-as>",
                            },
                            {
                                label: "time",
                                prefix: '<say-as interpret-as="time format="hms12">',
                                suffix: "</say-as>",
                            },
                            {
                                label: "expletive",
                                prefix: '<say-as interpret-as="expletive">',
                                suffix: "</say-as>",
                            },
                            {
                                label: "date",
                                prefix: '<say-as interpret-as="date" format="ymd">',
                                suffix: "</say-as>",
                            },
                        ],
                    },
                    {
                        label: "substitute",
                        prefix: '<sub alias="aluminium">',
                        suffix: "</sub>",
                    },
                    {
                        label: "prosody",
                        buttons: [
                            {
                                label: "rate",
                                prefix: '<prosody rate="medium">',
                                suffix: "</prosody>",
                            },
                            {
                                label: "pitch",
                                prefix: '<prosody pitch="medium">',
                                suffix: "</prosody>",
                            },
                            {
                                label: "volume",
                                prefix: '<prosody volume="medium">',
                                suffix: "</prosody>",
                            },
                        ],
                    },
                    {
                        label: "media container",
                        buttons: [
                            {
                                label: "parallel",
                                prefix: "<par>",
                                suffix: "</par>",
                            },
                            {
                                label: "sequential",
                                prefix: "<seq>",
                                suffix: "</seq>",
                            },
                        ],
                    },
                    {
                        label: "media layer",
                        buttons: [
                            {
                                label: "speak",
                                prefix: "<media><speak>",
                                suffix: "</speak></media>",
                            },
                            {
                                label: "audio",
                                prefix: "<media><audio>",
                                suffix: "</audio></media>",
                            },
                        ],
                    },
                ]
            }
        },
        {
            key: "setActivityParams",
			label: "Set Activity Parameters",
            type: "toggle",
            defaultValue: false
        },
        {
            key: "activityParams",
			label: "Other Activity Params",
            type: "json",
            defaultValue: "{}"
        }
    ].concat(getParameterFields()),
	sections: [
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"activityParams",
            ],
            condition: {
                key: "setActivityParams",
                value: true
            }
		}
	].concat(getParamSections({ key: "setActivityParams", value: true })),
	form: [
        { type: "field", key: "text" },
        { type: "field", key: "setActivityParams" },
		{ type: "section", key: "params_stt" },
		{ type: "section", key: "params_tts" },
		{ type: "section", key: "params_dtmf" },
		{ type: "section", key: "params_bargein" },
		{ type: "section", key: "params_continuousasr" },
		{ type: "section", key: "params_user_timeouts" },
		{ type: "section", key: "params_bot_timeouts" },
		{ type: "section", key: "params_azure" },
		{ type: "section", key: "params_google" },
		{ type: "section", key: "advanced" },
	],
	preview: {
		type: "text",
		key: "text"
	},
	appearance: {
		color: nodeColor
	},

	function: async ({ cognigy, config }: ISendMessageRequestParams) => {
		const { api } = cognigy;
		const { text, activityParams, setActivityParams } = config;

        let compiledParams = activityParams || {};

        if (setActivityParams) {
            compileParams(config, compiledParams);
        }

        if (text) {
            api.output(text, {
                "_cognigy": {
                    "_voiceGateway": {
                        "json": {
                            "activities": [
                                {
                                    "type": "message",
                                    "text": text,
                                    "activityParams": compiledParams
                                }
                            ]
                        }
                    }
                }
            });
        }
	}
});
