import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ICreateItemParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		boardID: string;
		itemName: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const createItemNode = createNodeDescriptor({
	type: "createItem",
	defaultLabel: "Create Item",
	fields: [
		{
			key: "connection",
			label: "API V2 Key",
			type: "connection",
			params: {
				connectionType: "monday",
				required: true
			}
		},
		{
			key: "itemName",
			label: "Item Name",
			type: "cognigyText",
			description: "The name of the board item you want to create.",
			params: {
				required: true,
			},
		},
		{
			key: "boardID",
			label: "Board ID",
			type: "cognigyText",
			defaultValue: "{{context.monday.boards.data.boards[0].id}}",
			description: "The ID of the board where the item should be created.",
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
			defaultValue: "monday.item",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "monday.item",
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
		{ type: "field", key: "boardID" },
		{ type: "field", key: "itemName" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#f54040"
	},
	function: async ({ cognigy, config }: ICreateItemParams) => {
		const { api } = cognigy;
		const { boardID, itemName, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		let query: string = `mutation ($myItemName: String!) { create_item (board_id:${boardID}, item_name:$myItemName) { id } }`;
		let vars = { "myItemName": itemName };

		try {
			const response = await axios({
				method: 'post',
				url: `https://api.monday.com/v2`,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': key
				},
				data: JSON.stringify({
					'query': query,
					'variables': vars
				})
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
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