import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AccessToken } from "../../types/uipath";

export interface ICloudAuthenticationParams extends INodeFunctionBaseParams {
	config: {
		accessInfo: {
			clientId: string;
			refreshToken: string;
        };
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const cloudAuthenticationNode = createNodeDescriptor({
	type: "cloudAuthentication",
	defaultLabel: "Cloud Authentication",
	fields: [
		{
			key: "accessInfo",
			label: "UiPath Connection",
			type: "connection",
			params: {
				connectionType: "accessData",
				required: true
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
			defaultValue: "uiPathAccessToken",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uiPathAccessToken",
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
		{ type: "field", key: "accessInfo" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#2d7cc2"
	},
	function: async ({ cognigy, config }: ICloudAuthenticationParams) => {
        const { api } = cognigy;
		const { accessInfo, storeLocation, inputKey, contextKey } = config;
		const { clientId, refreshToken } = accessInfo;

        const endpoint = 'https://account.uipath.com/oauth/token';
        const axiosConfig: AxiosRequestConfig = {
													"headers":
														{
															"Content-Type" : "application/json"
														}
												};

        const data = {
            'grant_type': "refresh_token",
            'client_id': clientId,
            'refresh_token': refreshToken
        };
		try {
			const response: AxiosResponse <AccessToken> = await axios.post(endpoint, data, axiosConfig);
			if (storeLocation === 'context') {
				api.addToContext(contextKey, response.data.access_token , 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data.access_token);
			}
		} catch (error) {
			if (storeLocation === 'context') {
				api.addToContext(contextKey, { error: error.message }, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});