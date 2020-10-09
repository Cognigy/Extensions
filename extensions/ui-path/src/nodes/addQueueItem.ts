import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getToken, addQueueItemHelper } from '../helpers/api.js';
import uuid from 'uuid';

export interface IAddQueueItemParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			client_id: string;
			refresh_token: string;
			account_logical_name: string;
			service_instance_logical_name: string;
		};
		queueName: string;
		priority: string;
		specificContent: any;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const addQueueItemsNode = createNodeDescriptor({
	type: "addQueueItems",
	defaultLabel: "Add Queue Items",
	preview: {
		key: "queueName",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "UIPath Connection",
			type: "connection",
			params: {
				connectionType: "uipath",
				required: true
			}
		},
		{
			key: "queueName",
			label: "Queue Name",
			type: "cognigyText",
			params: {
				required: true,
			},
		},
		{
			key: "priority",
			type: "select",
			label: "Priority",
			defaultValue: "Low",
			params: {
				options: [
					{
						label: "Low",
						value: "Low"
					},
					{
						label: "Normal",
						value: "Normal"
					},
					{
						label: "High",
						value: "High"
					}
				],
				required: true
			},
		},
		{
			key: "specificContent",
			label: "JSON Payload",
			type: "json",
			params: {
				required: true
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			defaultValue: "input",
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
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "uipath",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uipath",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},
	],
	sections: [
		{
			key: "storage",
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
		{ type: "field", key: "queueName" },
		{ type: "field", key: "priority" },
		{ type: "field", key: "specificContent" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#f56105"
	},
	function: async ({ cognigy, config }: IAddQueueItemParams) => {
		const { api } = cognigy;
		const { queueName, priority, specificContent, connection, storeLocation, contextKey, inputKey } = config;
		const { client_id, refresh_token, account_logical_name, service_instance_logical_name } = connection;

		try {
			const tokenResult = await getToken({
				client_id,
				refresh_token
			});

			const resultId = uuid.v4();

			const queueItem = {
				itemData: {
					Name: queueName,
					Priority: priority,
					SpecificContent: {
						...specificContent,
						ResultId: resultId,
						'ResultId@odata.type': '#String',
					}
				}
			};

			const addQueueItemResponse = await addQueueItemHelper(queueItem, {
				access_token: tokenResult.access_token,
				account_logical_name: account_logical_name,
				service_instance_logical_name: service_instance_logical_name
			});


			if (storeLocation === "context") {
				api.addToContext(contextKey, addQueueItemResponse, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, addQueueItemResponse);
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