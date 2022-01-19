import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AddTransactionItem } from "../../../types/uipath";

export interface IAddQueueItem extends INodeFunctionBaseParams {
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
		orgUnitId: string;
        queueName: string;
        reference: string;
        priority: string;
        specificContent: any;
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const addQueueItemNode = createNodeDescriptor({
	type: "addQueueItem",
	defaultLabel: "Add a Queue Item",
	summary: "Add items to an already existing queue",
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
			key: "orgUnitId",
			label: "Organization Unit ID",
			type: "cognigyText",
			params: {
				required: true
			}
        },
        {
			key: "queueName",
			label: "Queue Name",
			type: "cognigyText",
			params: {
				required: true
			}
        },
        {
			key: "reference",
			label: "Queue Reference",
			type: "cognigyText",
			params: {
				required: false
			}
		},        {
			key: "priority",
			label: "Transaction Item Priority",
			type: "select",
			params: {
                options: [
                    {
                        label: "Low",
                        value: "Low"
                    },
                    {
                        label: "High",
                        value: "High"
                    }
                ],
				required: true
			}
		},
        {
			key: "specificContent",
			label: "Transaction Item Specific Content",
			type: "json",
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
			label: "Input Key to store Result",
			defaultValue: "uipath.queueItemId",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uipath.queueItemId",
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
		{ type: "field", key: "orgUnitId"},
		{ type: "field", key: "queueName" },
		{ type: "field", key: "reference" },
		{ type: "field", key: "priority" },
		{ type: "field", key: "specificContent" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IAddQueueItem) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, orgUnitId, queueName, reference, priority,
				specificContent, storeLocation, inputKey, contextKey, authType, onPremAuthConnection } = config;

		let endpoint;
		let tenantInfo;
		if (authType === 'cloud') {
			const { accountLogicalName, tenantLogicalName } = instanceInfo;
			endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Queues/UiPathODataSvc.AddQueueItem`;
			tenantInfo = tenantLogicalName;
		} else { // onPrem
			const { tenancyName, orchestratorUrl } = onPremAuthConnection;
			endpoint = `https://${orchestratorUrl}/odata/Queues/UiPathODataSvc.AddQueueItem`;
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
			itemData: {
				Name: queueName,
				Reference: reference,
				Priority: priority.charAt(0).toUpperCase() + priority.slice(1),
				SpecificContent: specificContent,
				DeferDate: null,
				DueDate: null
			}
		};
		try {
            const result: AxiosResponse <AddTransactionItem> =  await axios.post(endpoint, data, axiosConfig);

			if (storeLocation === 'context') {
				api.addToContext(contextKey, result.data.Id , 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result.data.Id);
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