import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IStartMicrosoftFlow extends INodeFunctionBaseParams {
	config: {
		flowURL: string;
		flowMethod: string;
		useCallback: boolean;
		callbackUserId: string;
		callbackSessionId: string;
		callbackURL: string;
		callbackToken: string;
		callbackText: string;
		callbackData: any;
		patchData: any;
		postData: any;
		putData: any;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const startMicrosoftFlowNode = createNodeDescriptor({
	type: "startMicrosoftFlow",
	defaultLabel: "Start Flow",
	preview: {
		key: "flowURL",
		type: "text"
	},
	fields: [
		{
			key: "flowURL",
			label: "Flow URL",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "flowMethod",
			type: "select",
			label: "Method",
			params: {
				options: [
					{
						label: "DELETE",
						value: "delete"
					},
					{
						label: "GET",
						value: "get"
					},
					{
						label: "PATCH",
						value: "patch"
					},
					{
						label: "POST",
						value: "post"
					},
					{
						label: "PUT",
						value: "put"
					}
				],
				required: true
			},
			defaultValue: "post"
		},
		{
			key: "patchData",
			type: "json",
			label: "Payload",
			defaultValue: {},
			condition: {
				key: "flowMethod",
				value: "patch"
			}
		},
		{
			key: "postData",
			type: "json",
			label: "Payload",
			defaultValue: {},
			condition: {
				key: "flowMethod",
				value: "post"
			}
		},
		{
			key: "putData",
			type: "json",
			label: "Payload",
			defaultValue: {},
			condition: {
				key: "flowMethod",
				value: "put"
			}
		},
		{
			key: "useCallback",
			label: "Use Callback",
			type: "toggle",
			defaultValue: false,
			condition: {
				key: "flowMethod",
				value: "post"
			}
		},
		{
			key: "callbackUserId",
			label: "User ID",
			type: "cognigyText",
			defaultValue: "{{ci.userId}}",
			params: {
				required: true
			},
			condition: {
				key: "useCallback",
				value: true
			}
		},
		{
			key: "callbackSessionId",
			label: "Session ID",
			type: "cognigyText",
			defaultValue: "{{ci.sessionId}}",
			params: {
				required: true
			},
			condition: {
				key: "useCallback",
				value: true
			}
		},
		{
			key: "callbackURL",
			label: "URL",
			type: "cognigyText",
			params: {
				required: true
			},
			condition: {
				key: "useCallback",
				value: true
			}
		},
		{
			key: "callbackToken",
			label: "Token",
			type: "cognigyText",
			params: {
				required: true
			},
			condition: {
				key: "useCallback",
				value: true
			}
		},
		{
			key: "callbackText",
			label: "Text",
			type: "cognigyText",
			params: {
				required: false
			},
			condition: {
				key: "useCallback",
				value: true
			}
		},
		{
			key: "callbackData",
			label: "Data",
			type: "json",
			params: {
				required: false
			},
			condition: {
				key: "useCallback",
				value: true
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
			defaultValue: "msFlows",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "msFlows",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "callbackConfig",
			label: "Callback Config",
			defaultCollapsed: true,
			fields: [
				"callbackURL",
				"callbackToken",
				"callbackUserId",
				"callbackSessionId"
			],
			condition: {
				key: "useCallback",
				value: true
			}
		},
		{
			key: "callbackPayload",
			label: "Callback Payload",
			defaultCollapsed: true,
			fields: [
				"callbackText",
				"callbackData"
			],
			condition: {
				key: "useCallback",
				value: true
			}
		},
		{
			key: "storageOption",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "flowURL" },
		{ type: "field", key: "flowMethod" },
		{ type: "field", key: "patchData" },
		{ type: "field", key: "postData" },
		{ type: "field", key: "putData" },
		{ type: "field", key: "useCallback" },
		{ type: "section", key: "callbackConfig" },
		{ type: "section", key: "callbackPayload" },
		{ type: "section", key: "storageOption" }
	],

	function: async ({ cognigy, config }: IStartMicrosoftFlow) => {
		const { api } = cognigy;
		const { flowURL, flowMethod, patchData, postData, putData, useCallback, callbackURL, callbackToken, callbackUserId, callbackSessionId, callbackText, callbackData, storeLocation, inputKey, contextKey } = config;

		try {

			let axiosObject = {};
			let data = {};
			let addData = false;

			switch (flowMethod) {
				case "patch":
					data = patchData;
					addData = true;
					break;
				case "post":
					data = postData;
					if (useCallback) {
						data = {
							userId: callbackUserId,
							sessionId: callbackSessionId,
							URLToken: callbackToken,
							callbackURL: callbackURL,
							text: callbackText,
							data: callbackData,
							payload: data
						};
					}
					addData = true;
					break;
				case "put":
					data = putData;
					addData = true;
					break;
			}

			if (addData) {
				axiosObject = {
					method: flowMethod,
					url: flowURL,
					headers: {
						'Content-Type': 'application/json'
					},
					data: data
				};
			} else {
				axiosObject = {
					method: flowMethod,
					url: flowURL,
					headers: {
						'Content-Type': 'application/json'
					}
				};
			}

			const response = await axios(axiosObject);
			if (storeLocation === "context") {
				api.addToContext(contextKey, response, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response);
			}

		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}
	}
});