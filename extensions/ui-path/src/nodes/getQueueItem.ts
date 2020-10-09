import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getToken, addQueueItemHelper } from '../helpers/api.js';

export interface IGetQueueItemParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			client_id: string;
			refresh_token: string;
			account_logical_name: string;
			service_instance_logical_name: string;
		};
		filter: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getQueueItemsNode = createNodeDescriptor({
	type: "getQueueItems",
	defaultLabel: "Get Queue Item",
	preview: {
		key: "filter",
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
			key: "filter",
			label: "Filter",
			description: "The UIPath filter string",
			type: "cognigyText",
			params: {
				required: true,
			},
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
		{ type: "field", key: "filter" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#f56105"
	},
	function: async ({ cognigy, config }: IGetQueueItemParams) => {
		const { api } = cognigy;
		const { filter, connection, storeLocation, contextKey, inputKey } = config;
		const { client_id, refresh_token, account_logical_name, service_instance_logical_name } = connection;

		try {
			const tokenResult = await getToken({
				client_id,
				refresh_token
			});


			const queueItem = await (async () => {
				for (let polls = 0; polls < 15; polls++) {
					try {
						return await addQueueItemHelper({
							filter
						},
							{
								access_token: tokenResult.access_token,
								account_logical_name: account_logical_name,
								service_instance_logical_name: service_instance_logical_name
							});
					} catch (error) {
						api.log('error', 'Could not find item in return queue.');
					}

					await new Promise(r => setTimeout(r, 1000));
				}

				throw new Error('maximum polling retries reached!');
			})();

			if (storeLocation === "context") {
				api.addToContext(contextKey, queueItem, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, queueItem);
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