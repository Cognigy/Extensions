import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
const https = require('https');

export interface IGetCallParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			baseUrl: string;
			username: string;
			password: string;
		};
		targetId: string;
		callId: string;
		sysCallId: string;
		startTime: string;
		endTime: string;
		storeLocation: string
		inputKey: string;
		contextKey: string;
	};
}

export const getCallNode = createNodeDescriptor({
	type: "getCall",
	defaultLabel: "Get Call File",
	fields: [
		{
			key: "connection",
			label: "AudioCodes Connection",
			type: "connection",
			params: {
				connectionType: "audiocodes",
				required: true
			}
		},
		{
			key: "targetId",
			label: "Target ID",
			type: "cognigyText",
			defaultValue: "105",
			params: {
				required: true
			}
		},
		{
			key: "callId",
			label: "Select Call ID",
			type: "select",
			defaultValue: "sysCallId",
			params: {
				required: true,
				options: [
					{
						label: "System Call ID",
						value: "sysCallId"
					},
					{
						label: "Time",
						value: "time"
					}
				]
			}
		},
		{
			key: "sysCallId",
			label: "System Call ID",
			type: "cognigyText",
			defaultValue: "{{input.sessionId}}",
			params: {
				required: true
			},
			condition: {
				key: "callId",
				value: "sysCallId"
			}
		},
		{
			key: "startTime",
			label: "Minimum Start Time",
			description: "ISO Date",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: true
			},
			condition: {
				key: "callId",
				value: "time"
			}
		},
		{
			key: "endTime",
			label: "Minimum Release Time",
			description: "ISO Date",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: true
			},
			condition: {
				key: "callId",
				value: "time"
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			params: {
				options: [
					{
						label: "Input",
						value: "input"
					},
					{
						label: "Context",
						value: "context"
					}
				],
				required: true
			},
			defaultValue: "input"
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "audiocodes",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "audiocodes",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storageOption",
			label: "Storage Option",
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
		{ type: "field", key: "callId" },
		{ type: "field", key: "sysCallId" },
		{ type: "field", key: "startTime" },
		{ type: "field", key: "endTime" },
		{ type: "field", key: "targetId" },
		{ type: "section", key: "storageOption" },
	],
	function: async ({ cognigy, config }: IGetCallParams) => {
		const { api } = cognigy;
		const { connection, callId, targetId, sysCallId, startTime, endTime, storeLocation, inputKey, contextKey } = config;
		const { baseUrl, username, password } = connection;

		// create request url
		let url: string;
		if (callId === "sysCallId") {
			url = `${baseUrl}/rs/audiocodes/recorder/calls/info?targetId=${targetId}&sysCallId=${sysCallId}`;
		} else if (callId === "time") {
			url = `${baseUrl}/rs/audiocodes/recorder/calls/info?targetId=${targetId}&minStartTime=${startTime}&maxReleaseTime=${endTime}`;
		}

		const agent = new https.Agent({
			rejectUnauthorized: false
		});

		try {
			const response = await axios({
				method: 'get',
				url,
				headers: {
					'Accept': '*/*'
				},
				auth: {
					username,
					password
				},
				httpsAgent: agent
			});

			// get location information from xml response body
			const regexLocation = /file:\S+.wav/gm;
			const regexLocationMatches = response.data.match(regexLocation);
			// get starttime information from xml response body
			const regexStartTime = /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\d\w/gm;
			const regexStartTimeMatches = response.data.match(regexStartTime);


			let xmlBody = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
			 <mediaDescription xmlns='com:audiocodes:recorder' encoding="OPUS" fileFormat="webm">
				 <tracks>
					 <trackInfo>
						 <mediaInfo>
							 <location>${regexLocationMatches[0]}</location>
							 <startTime>${regexStartTimeMatches[0]}</startTime>
							 <direction>RECEIVE</direction>
						 </mediaInfo>
					 </trackInfo>
					 <trackInfo>
						 <mediaInfo>
							 <location>${regexLocationMatches[1]}</location>
							 <startTime>${regexStartTimeMatches[1]}</startTime>
							 <direction>TRANSMIT</direction>
						 </mediaInfo>
					 </trackInfo>
				 </tracks>
			 </mediaDescription>`;

			try {

				const fileResponse = await axios({
					method: 'post',
					url: `${baseUrl}/rs/audiocodes/recorder/media`,
					headers: {
						'Accept': '*/*',
						'Content-Type': 'application/xml'
					},
					auth: {
						username,
						password
					},
					httpsAgent: agent,
					data: xmlBody
				});

				// create data url in order to use wav file
				const dataUrl = `data:audio/wav;base64,${Buffer.from(fileResponse.data).toString('base64')}`;

				if (storeLocation === "context") {
					api.addToContext(contextKey, {
						format: 'audio/wav',
						dataUrl
					}, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, {
						format: 'audio/wav',
						dataUrl
					});
				}

			} catch (error) {
				if (storeLocation === "context") {
					api.addToContext(contextKey, error.message, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, error.message);
				}
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});
