import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { compileParams, getParameterFields, getParamSections } from "../utils/paramUtils";

export interface IRequestParams extends INodeFunctionBaseParams {
	config: {
		playUrlUrl: string;
        playUrlMediaFormat: string;
        playUrlAltText: string;
		playUrlCaching: boolean;
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

export const playURLNode = createNodeDescriptor({
	type: "playURL",
	defaultLabel: "Play URL",
	// @ts-ignore
	fields: [
		{
			key: "playUrlUrl",
			label: "Media URL",
            type: "cognigyText",
            params: {
                required: true
            }
		},
		{
			key: "playUrlMediaFormat",
			label: "Media Format",
			type: "select",
			defaultValue: "wav/lpcm16",
			params: {
				options: [
					{
						label: "wav/lpcm16",
						value: "wav/lpcm16"
					},
					{
						label: "raw/lpcm16",
						value: "raw/lpcm16"
					}
				]
			}
        },
        {
			key: "playUrlAltText",
			label: "Alt Text",
            type: "cognigyText",
            description: "Defines the text to display in the transcript page of the user interface while the audio is played",
            defaultValue: ""
        },
        {
			key: "playUrlCaching",
			label: "Cache Audio",
            type: "toggle",
            defaultValue: false
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
		{ type: "field", key: "playUrlUrl" },
		{ type: "field", key: "playUrlMediaFormat" },
		{ type: "field", key: "playUrlCaching" },
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
		key: "playUrlUrl"
	},
	appearance: {
		color: "#F5A623"
	},

	function: async ({ cognigy, config }: IRequestParams) => {
		const { api } = cognigy;
		const { playUrlUrl, playUrlMediaFormat, playUrlAltText, setActivityParams, activityParams } = config;

		if (playUrlUrl && playUrlMediaFormat) {
			let compiledParams = Object.assign(activityParams || {}, {
				playUrlUrl,
				playUrlMediaFormat
			});

			if (playUrlAltText) compiledParams["playUrlAltText"] = playUrlAltText;

			if (setActivityParams) {
				compileParams(config, compiledParams);
			}

			api.output(null, {
				"_cognigy": {
					"_audioCodes": {
						"json": {
							"activities": [
								{
									"type": "event",
									"name": "playUrl",
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