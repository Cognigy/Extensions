import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

/**
 * Retrieve an item by path.
 */

export default interface IGetItem extends INodeFunctionBaseParams {
	config: {
		connection: {
			apiEndpoint: string
		};
		contentPath: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getItem = createNodeDescriptor({
	type: "getItem",
	defaultLabel: "Get Item By Path",
	fields: [
		{
			key: "connection",
			label: "The Sitecore API Endpoint",
			type: "connection",
			params: {
				connectionType: "sitecore",
				required: true
			}
		},
		{
			key: "contentPath",
			label: "Sitecore Content Path",
			type: "cognigyText",
			defaultValue: "/sitecore/content/Home",
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
			defaultValue: "sitecore.item",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "sitecore.item",
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
		{ type: "field", key: "contentPath" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#FE2911"
	},
	preview: {
		type: "text",
		key: "contentPath"
	},
	function: async ({ cognigy, config }: IGetItem) => {
		const { api } = cognigy;
		const { contentPath, connection, storeLocation, inputKey, contextKey } = config;
		const { apiEndpoint } = connection;

		try {
			const response = await axios.get(`${apiEndpoint}/item?path=${contentPath}`,
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