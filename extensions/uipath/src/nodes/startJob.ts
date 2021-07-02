import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { StartJob } from "../../types/uipath";

export interface ICreateTokenParams extends INodeFunctionBaseParams {
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
		accessToken: string;
        releaseKey: string;
		orgUnitId: string;
        robotIds: string;
		inputArguments: string;
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const startJobNode = createNodeDescriptor({
	type: "startJobNode",
	defaultLabel: "Start a Job",
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
			key: "accessToken",
			label: "Access Token",
			type: "cognigyText",
			params: {
				required: true
			}
        },
        {
			key: "releaseKey",
			label: "Process Release Key",
			type: "cognigyText",
			params: {
				required: true
			}
        },
		{
			key: "orgUnitId",
			label: "Organization Unit ID",
			type: "cognigyText",
			params: {
				required: true
			}
        },
        {
			key: "robotIds",
			label: "Robot IDs",
			type: "cognigyText",
			params: {
				required: true
			}
        },
		{
			key: "inputArguments",
			label: "Input Arguments",
			type: "json",
			defaultValue: {},
			params: {
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
			label: "Input Key to Store Result",
			defaultValue: "uiPathProcessState",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to Store Result",
			defaultValue: "uiPathProcessState",
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
		{ type: "field", key: "accessToken" },
		{ type: "field", key: "releaseKey" },
		{ type: "field", key: "orgUnitId" },
		{ type: "field", key: "robotIds" },
		{ type: "field", key: "inputArguments" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: ICreateTokenParams) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, releaseKey, orgUnitId, robotIds, inputArguments, storeLocation, inputKey, contextKey, authType, onPremAuthConnection } = config;

		let endpoint;
		let tenantInfo;
		let ids = [];
		ids.push(robotIds);
		if (authType === 'cloud') {
			const { accountLogicalName, tenantLogicalName } = instanceInfo;
			endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`;
			tenantInfo = tenantLogicalName;
		} else { // onPrem
			const { tenancyName, orchestratorUrl } = onPremAuthConnection;
			endpoint = `https://${orchestratorUrl}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`;
			tenantInfo = tenancyName;
		}
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'X-UIPATH-TenantName': tenantInfo,
				'X-UIPATH-OrganizationUnitId': orgUnitId
            }
        };
        const data = {
            startInfo: {
                ReleaseKey: releaseKey,
                RobotIds: ids,
                Strategy: "Specific",
				InputArguments: JSON.stringify(inputArguments)
              }
		};
		try {
            const result: AxiosResponse <StartJob> =  await axios.post(endpoint, data, axiosConfig);
			if (storeLocation === 'context') {
				api.addToContext(contextKey, result.data.value[0] , 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result.data.value[0]);
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