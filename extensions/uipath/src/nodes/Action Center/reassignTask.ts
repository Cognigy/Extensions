import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IReassignTaskParams extends INodeFunctionBaseParams {
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
		taskId: string;
		userId: string;
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const reassignTaskNode = createNodeDescriptor({
	type: "reassignTaskNode",
	defaultLabel: "Reassign Task to New User",
	summary: "Reassign an already assigned task to a new user.",
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
			key: "taskId",
			label: "Task ID",
			type: "cognigyText",
			params: {
				required: true
			}
        },
		{
			key: "userId",
			label: "User ID",
			type: "cognigyText",
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
			defaultValue: "uipath.reassignedTask",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to Store Result",
			defaultValue: "uipath.reassignedTask",
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
		{ type: "field", key: "orgUnitId" },
		{ type: "field", key: "taskId" },
		{ type: "field", key: "userId" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IReassignTaskParams) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, taskId, userId, storeLocation, inputKey, contextKey, authType, onPremAuthConnection } = config;

		let endpoint;
		if (authType === 'cloud') {
			const { accountLogicalName, tenantLogicalName } = instanceInfo;
			endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Tasks/UiPath.Server.Configuration.OData.ReassignTasks`;
		} else { // onPrem
			const { orchestratorUrl } = onPremAuthConnection;
			endpoint = `https://${orchestratorUrl}/odata/Tasks/UiPath.Server.Configuration.OData.ReassignTasks`;
		}
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`
            }
        };
        const data = {
            taskAssignments: [
				{
					TaskId: taskId,
					UserId: userId
				}
			]
		};
		try {
            const result: AxiosResponse =  await axios.post(endpoint, data, axiosConfig);
			if (storeLocation === 'context') {
				api.addToContext(contextKey, result.data , 'simple');
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