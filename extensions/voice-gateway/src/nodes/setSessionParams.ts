import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getParamSections, getParameterFields, compileParams } from '../utils/paramUtils';
import { nodeColor } from '../utils/design';

export interface ISetSessionParams extends INodeFunctionBaseParams {
	config: {
		sessionParams: any;
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
export const setSessionParamsNode = createNodeDescriptor({
	type: "setSessionParams",
	defaultLabel: "Set Session Parameters",
	summary: "Sets VG configuration settings for the session",
	// @ts-ignore
	fields: [
		{
			key: "sessionParams",
			label: "Additional Session Parameters",
			type: "json",
			defaultValue: "{}",
			params: {
				required: true
			}
		}
	].concat(getParameterFields()),
	sections: [
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"sessionParams",
			]
		}
	].concat(getParamSections()),
	appearance: {
		color: nodeColor
	},
	form: [
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
	function: async ({ cognigy, config }: ISetSessionParams) => {
		const { api } = cognigy;
		const {
			sessionParams
		} = config;

		let compiledParams = sessionParams || {};
		compileParams(config, compiledParams);

		// output the activity to the voice gateway
		api.output(null, {
			"_cognigy": {
				"_audioCodes": {
					"json": {
						"activities": [
							{
								"type": "event",
								"name": "config",
								"sessionParams": compiledParams
							}
						]
					}
				}
			}
		});
	}
});