import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import fuseSearch from "../helpers/fuseSearch";

export interface ISearchParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			region: string;
			accessKeyId: string;
			secretAccessKey: string;
		};
		searchText: string;
		items: object;
		options: object;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const searchNode = createNodeDescriptor({
	type: "search",
	defaultLabel: "Search",
	fields: [
		{
			key: "searchText",
			label: "Search Text",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "items",
			label: "Items",
			type: "json",
			params: {
				required: true
			}
		},
		{
			key: "options",
			label: "Options",
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
			defaultValue: "search",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "search",
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
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "searchText" },
		{ type: "field", key: "items" },
		{ type: "field", key: "options" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#87077f"
	},
	function: async ({ cognigy, config }: ISearchParams) => {
		const { api } = cognigy;
		const { connection, searchText, items, options, storeLocation, inputKey, contextKey } = config;
		const { region, accessKeyId, secretAccessKey } = connection;

		try {

			const result = await fuseSearch(items, options, searchText);

			if (storeLocation === "context") {
				api.addToContext(contextKey, result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result);
			}

		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}
	}
});