import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
// Load the SDK
const AWS = require('aws-sdk');


export interface ISayPollyParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			region: string;
			accessKeyId: string;
			secretAccessKey: string;
		};
		text: string;
		voice: string;
	};
}
export const sayPollyNode = createNodeDescriptor({
	type: "sayPolly",
	defaultLabel: "Say Polly",
	fields: [
		{
			key: "connection",
			label: "AWS Connection",
			type: "connection",
			params: {
				connectionType: "aws",
				required: true
			}
		},
		{
			key: "text",
			label: "Text",
			type: "cognigyText",
			defaultValue: "{{input.text}}",
			params: {
				required: true
			}
		},
		{
			key: "voice",
			type: "select",
			label: "AWS Polly Voice",
			defaultValue: "Salli",
			params: {
				options: [
					{
						label: "Salli",
						value: "Salli"
					},
					{
						label: "Kimberly",
						value: "Kimberly"
					},
					{
						label: "Joey",
						value: "Joey"
					},
					{
						label: "Marlene",
						value: "Marlene"
					},
					{
						label: "Hans",
						value: "Hans"
					},
					{
						label: "Vicki",
						value: "Vicki"
					}
				],
				required: false
			},
		}
	],
	sections: [
		{
			key: "connectionSection",
			label: "Connection",
			defaultCollapsed: false,
			fields: [
				"connection",
			]
		},
		{
			key: "polly",
			label: "AWS Polly Options",
			defaultCollapsed: true,
			fields: [
				"voice",
			]
		}
	],
	form: [
		{ type: "section", key: "connectionSection" },
		{ type: "field", key: "text" },
		{ type: "section", key: "polly" }
	],
	appearance: {
		color: "#FF9900"
	},
	function: async ({ cognigy, config }: ISayPollyParams) => {
		const { api } = cognigy;
		const { connection, text, voice } = config;
		const { region, accessKeyId, secretAccessKey } = connection;

		if (!text) throw new Error('The text is missing. Please define what Polly should say.');
		if (!voice) throw new Error('Please select a voice for polly.');


		AWS.config.accessKeyId = accessKeyId;
		AWS.config.secretAccessKey = secretAccessKey;

		// Create an Polly client
		const presigner = new AWS.Polly.Presigner({
			signatureVersion: 'v4',
			region
		});

		const params = {
			OutputFormat: "mp3",
			SampleRate: "8000",
			Text: text,
			TextType: "text",
			VoiceId: voice,
		};

		// get the polly mp3 file url
		let url = presigner.getSynthesizeSpeechUrl(params, 3600);

		// send command to webchat to play polly
		api.say('', {
			read: true,
			url
		});
	}
});