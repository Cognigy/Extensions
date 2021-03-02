import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetBoardsParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		limit: number;
		getBoardName: boolean;
		getBoardID: boolean;
		getBoardDesc: boolean;
		getBoardItems: boolean;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getBoardsNode = createNodeDescriptor({
	type: "getBoards",
	defaultLabel: "Get Boards",
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
			key: "limit",
			label: "Number of Boards",
			type: "number",
			defaultValue: "10",
			params: {
				required: true,
			},
		},
		{
			key: "getBoardName",
			label: "Get Board Name",
			type: "toggle",
			defaultValue: true,
			params: {
				required: true,
			},
		},
		{
			key: "getBoardID",
			label: "Get Board ID",
			type: "toggle",
			defaultValue: true,
			params: {
				required: true,
			},
		},
		{
			key: "getBoardDesc",
			label: "Get Board Description",
			type: "toggle",
			defaultValue: true,
			params: {
				required: true,
			},
		},
		{
			key: "getBoardItems",
			label: "Get Board Items",
			type: "toggle",
			defaultValue: false,
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
			defaultValue: "monday.boards",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "monday.boards",
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
		},
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"limit",
				"getBoardID",
				"getBoardName",
				"getBoardDesc",
				"getBoardItems"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#f54040"
	},
	function: async ({ cognigy, config }: IGetBoardsParams) => {
		const { api } = cognigy;
		const { limit, getBoardName, getBoardID, getBoardDesc, getBoardItems, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		let query: string = `{ boards (limit:${limit}) { ${getBoardName ? 'name' : ''} ${getBoardID ? 'id' : ''} ${getBoardDesc ? 'description' : ''} ${getBoardItems ? `items { name column_values { title id type text } }` : ''} } }`;

		try {
			const response = await axios({
				method: 'post',
				url: `https://api.monday.com/v2`,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': key
				},
				data: JSON.stringify({
					'query': query
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