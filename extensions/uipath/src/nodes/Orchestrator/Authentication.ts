import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AccessToken } from "../../../types/uipath";

export interface IAuthenticationParams extends INodeFunctionBaseParams {
	config: {
		authType: string;
		instanceInfo: {
			accountLogicalName: string;
			tenantLogicalName: string;
			clientId: string;
			userKey: string;
        };
		onPremAuthConnection: {
			orchestratorUrl: string;
			tenancyName: string;
			usernameOrEmailAddress: string;
			password: string;
		};
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const AuthenticationNode = createNodeDescriptor({
	type: "Authentication",
	defaultLabel: "Authentication",
	summary: "Required node which must be added when using UiPath.",
	fields: [
		{
			key: "authType",
			label: "Connection Type",
			type: "select",
			description: "Please choose the type of connection",
			params: {
				options: [
					{
						label: "On-premise",
						value: "onPrem"
					},
					{
						label: "Cloud",
						value: "cloud"
					}
				],
				required: true
			},
			defaultValue: "cloud"
		},
		{
			key: "instanceInfo",
			label: "Orchestrator Instance Information",
			type: "connection",
			params: {
				connectionType: "instanceData",
				required: false
			},
			condition: {
			 	key: "authType",
			 	value: "cloud"
			}
		},
		{
            key: "onPremAuthConnection",
            label: "UiPath On-Prem Connection",
            type: "connection",
            params: {
                 connectionType: "onPremAuth",
                 required: false
            },
			 condition: {
			 	key: "authType",
			 	value: "onPrem"
			}
        },
		{
			key: "storeLocation",
			type: "select",
			label: "Where to Store the Result",
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
			label: "Input Key to Store Result",
			defaultValue: "uiPathAccessToken",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to Store Result",
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
		{ type: "field", key: "authType" },
		{ type: "field", key: "instanceInfo" },
		{ type: "field", key: "onPremAuthConnection" },
		{ type: "section", key: "storageOption" },
	],
	tokens: [
		{
			label: "UiPath AccessToken Input",
			script: "ci.uiPathAccessToken",
			type: "input"
		},
		{
			label: "UiPath AccessToken Context",
			script: "cc.uiPathAccessToken",
			type: "context"
		}
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IAuthenticationParams) => {
        const { api } = cognigy;
		const { instanceInfo, storeLocation, inputKey, contextKey, authType, onPremAuthConnection } = config;

        let endpoint;
		let data;
		if (authType === 'cloud') {
			const { clientId, userKey } = instanceInfo;
			endpoint = 'https://account.uipath.com/oauth/token';
			data = {
				'grant_type': "refresh_token",
            	'client_id': clientId,
            	'refresh_token': userKey
			};
		} else { // onPrem
			const { tenancyName, orchestratorUrl, password, usernameOrEmailAddress } = onPremAuthConnection;
			endpoint = `https://${orchestratorUrl}/api/account/authenticate`;
			data = {
				'tenancyName': tenancyName,
				'usernameOrEmailAddress': usernameOrEmailAddress,
				'password': password
			};
		}
        const axiosConfig: AxiosRequestConfig = {
			"headers":
			{
				"Content-Type" : "application/json"
			}
		};
		try {
			const response: AxiosResponse <AccessToken> = await axios.post(endpoint, data, axiosConfig);
			if (storeLocation === 'context') {
				if (authType === 'cloud') {
					api.addToContext(contextKey, response.data.access_token , 'simple');
				} else if (authType === 'onPrem') {
					api.addToContext(contextKey, response.data.result , 'simple');
				}
			} else if (storeLocation === 'input') {
				if (authType === 'cloud') {
					// @ts-ignore
					api.addToInput(inputKey, response.data.access_token);
				} else if (authType === 'onPrem') {
					// @ts-ignore
					api.addToInput(inputKey, response.data.result);
				}
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