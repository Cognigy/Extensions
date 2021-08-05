import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IGetProcessByNameParams extends INodeFunctionBaseParams {
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
		releaseName: string;
		accessToken: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getProcessByNameNode = createNodeDescriptor({
	type: "getProcessByName",
	defaultLabel: "Get Process By Name",
	summary: "Find a process based on it's name in the orchestrator folder.",
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
				connectionType: 'instanceData',
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
			key: "releaseName",
			label: "Name of Release",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "accessToken",
			label: "Access Token",
			type: "cognigyText",
			params: {
				required: true
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
			defaultValue: "uipath.specificRelease",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uipath.specificRelease",
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
		{ type: "field", key: "onPremAuthConnection" },
		{ type: "field", key: "instanceInfo" },
		{ type: "field", key: "releaseName" },
		{ type: "field", key: "accessToken" },
		{ type: "section", key: "storageOption" }
	],
	tokens: [
		{
			label: "Process Release Key Context",
			script: "cc.uipath.releases.value[0].Key",
			type: "context"
		},
		{
			label: "Process Release Key Input",
			script: "ci.uipath.releases.value[0].Key",
			type: "input"
		},
		{
			label: "Organization Unit ID Context",
			script: "cc.uipath.releases.value[0].OrganizationUnitId",
			type: "context"
		},
		{
			label: "Organization Unit ID Input",
			script: "ci.uipath.releases.value[0].OrganizationUnitId",
			type: "input"
		}
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IGetProcessByNameParams) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, storeLocation, inputKey, contextKey, authType, onPremAuthConnection, releaseName } = config;

		let endpoint;
		let tenantInfo;
		if (authType === 'cloud') {
			const { accountLogicalName, tenantLogicalName } = instanceInfo;
			endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Releases/`;
			tenantInfo = tenantLogicalName;
	 	} else { // onPrem
			const { tenancyName, orchestratorUrl } = onPremAuthConnection;
			endpoint = `https://${orchestratorUrl}/odata/Releases/`;
			tenantInfo = tenancyName;
		}
		const axiosConfig: AxiosRequestConfig = {
			params: {
				$filter: `Name eq '${releaseName}'`
			},
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'X-UIPATH-TenantName': tenantInfo
			}
		};
		try {
			const result: AxiosResponse = await axios.get(endpoint, axiosConfig);
			if (storeLocation === 'context') {
				api.addToContext(contextKey, result.data, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result.data);
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