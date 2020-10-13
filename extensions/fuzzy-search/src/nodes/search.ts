import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import fuseSearch from "../helpers/fuseSearch";

export interface ISearchParams extends INodeFunctionBaseParams {
	config: {
		searchText: string;
		items: object;
		optionsField: object;
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
			description: "Search the current items by free text and get a list of found items according to the options.",
			type: "json",
			params: {
				required: true
			}
		},
		{
			key: "optionsField",
			label: "Search Options",
			type: "json",
			params: {
				required: false
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
		},
		{
			key: "options",
			label: "Options",
			defaultCollapsed: true,
			fields: [
				"optionsField",
			]
		}
	],
	form: [
		{ type: "field", key: "searchText" },
		{ type: "field", key: "items" },
		{ type: "section", key: "options" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#87077f"
	},
	function: async ({ cognigy, config }: ISearchParams) => {
		const { api } = cognigy;
		const { searchText, items, optionsField, storeLocation, inputKey, contextKey } = config;

		try {

			const result = await fuseSearch(items, optionsField, searchText);

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