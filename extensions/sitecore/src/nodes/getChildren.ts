import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

/**
 * Retrieve an item and its children.
 */

export default interface IGetChildren extends INodeFunctionBaseParams {
	config: {
		connection: {
			apiEndpoint: string
		};
		contentPathId: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getChildren = createNodeDescriptor({
	type: "getChildren",
	defaultLabel: "Get Child Items",
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
			key: "contentPathId",
			label: "Path Id",
			type: "cognigyText",
			defaultValue: "",
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
			defaultValue: "sitecore.children",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "sitecore.children",
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
		{ type: "field", key: "contentPathId" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#FE2911"
	},
	preview: {
		type: "text",
		key: "contentPathId"
	},
	function: async ({ cognigy, config }: IGetChildren) => {
		const { api } = cognigy;
		const { storeLocation, inputKey, contextKey, contentPathId, connection } = config;
		const { apiEndpoint } = connection;

		try {
			const response = await axios.get(`${apiEndpoint}/item/${contentPathId}/children`,
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