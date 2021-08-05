import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AccessToken } from "../../../types/uipath";

export interface IStartJobSimplifiedParams extends INodeFunctionBaseParams {
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

export const StartJobSimplifiedNode = createNodeDescriptor({
	type: "startJobSimplifiedNode",
	defaultLabel: "Start a Job (Simplified)",
	summary: "Consolidates all the important UiPath Functions into one Node.",
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
	function: async ({ cognigy, config }: IStartJobSimplifiedParams) => {
        const { api } = cognigy;
		const { instanceInfo, storeLocation, inputKey, contextKey, authType, onPremAuthConnection } = config;

        let endpointAuth;
		let dataAuth;
		let endpointGetProcess;
		let dataGetProcess;
		let endpointStartJob;
		let dataStartJob;
		let tenantInfo
		let accessToken;
		let orgUnitId;

		if (authType === 'cloud') {
			const { clientId, userKey, accountLogicalName, tenantLogicalName } = instanceInfo;
			endpointAuth = 'https://account.uipath.com/oauth/token';
			dataAuth = {
				'grant_type': "refresh_token",
            	'client_id': clientId,
            	'refresh_token': userKey
			};
			endpointStartJob = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`;
			tenantInfo = tenantLogicalName;
		} else { // onPrem
			const { tenancyName, orchestratorUrl, password, usernameOrEmailAddress } = onPremAuthConnection;
			endpointAuth = `https://${orchestratorUrl}/api/account/authenticate`;
			dataAuth = {
				'tenancyName': tenancyName,
				'usernameOrEmailAddress': usernameOrEmailAddress,
				'password': password
			};
			endpointStartJob = `https://${orchestratorUrl}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`;
			tenantInfo = tenancyName;
		}
        const axiosConfigAuth: AxiosRequestConfig = {
			"headers":
			{
				"Content-Type" : "application/json"
			}
		};
		const axiosConfigStartJob: AxiosRequestConfig = {
			headers: {
                'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'X-UIPATH-TenantName': tenantInfo,
				'X-UIPATH-OrganizationUnitId': orgUnitId
            }
		};

		try {
			const responseAuth: AxiosResponse <AccessToken> = await axios.post(endpointAuth, dataAuth, axiosConfigAuth);
			if (authType === 'cloud') {
				accessToken = responseAuth.data.access_token;
			} else if (authType === 'onPrem') {
				accessToken = responseAuth.data.result;
			}
			
			if (storeLocation === 'context') {
				api.addToContext(contextKey, accessToken, 'simple');
				} 
				else if (storeLocation === 'input') {
					// @ts-ignore
					api.addToInput(inputKey, accessToken);
				};	
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