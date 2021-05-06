import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

/**
 * Search for an item.
 */

export default interface ISearch extends INodeFunctionBaseParams {
	config: {
		connection: {
			apiEndpoint: string
		};
		term: string;
		fields: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const search = createNodeDescriptor({
	type: "search",
	defaultLabel: "Search for Item",
	fields: [
		{
			key: "connection",
			label: "The api endpoint which should be used.",
			type: "connection",
			params: {
				connectionType: "sitecore" // this needs to match the connections 'type' property
			}
		},
		{
			key: "term",
			label: "Search Term",
			type: "cognigyText",
			description: "The search term such as Stagg",
			defaultValue: "{{input.text}}",
			params: {
				required: true
			}
		},
		{
			key: "fields",
			label: "Fields",
			description: "Need to be comma seperated",
			defaultValue: "ItemName,ProductDescription",
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
			label: "Input Key to store Result",
			defaultValue: "sitecore.search",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "sitecore.search",
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
		{ type: "field", key: "connection" },
		{ type: "field", key: "term" },
		{ type: "field", key: "fields" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#FE2911"
	},
	preview: {
		type: "text",
		key: "term"
	},
	function: async ({ cognigy, config }: ISearch) => {
		const { api } = cognigy;
		const { term, fields, connection, storeLocation, inputKey, contextKey } = config;
		const { apiEndpoint } = connection;

		try {
			const response = await axios.get(`${apiEndpoint}/item/search?term=${term}&fields=${fields}&database=web`,
				{
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					}
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