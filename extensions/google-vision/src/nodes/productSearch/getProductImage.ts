import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetProductParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
        productId: string;
        imageId: string;
		projectId: string;
		locationId: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getProductImageNode = createNodeDescriptor({
	type: "getProductImage",
	defaultLabel: "Get Product Image",
	fields: [
		{
			key: "connection",
			label: "API Key",
			type: "connection",
			params: {
				connectionType: "google-cloud-connection",
				required: true
			}
		},
		{
			key: "productId",
			label: "Product ID",
			type: "cognigyText",
			params: {
				required: true
			},
		},
		{
			key: "imageId",
			label: "Image ID",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "projectId",
			label: "Project ID",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "locationId",
			label: "Location ID",
			type: "cognigyText",
            defaultValue: "europe-west1",
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
			type: "text",
			label: "Input Key to store Result",
			defaultValue: "vision.image",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "text",
			label: "Context Key to store Result",
			defaultValue: "vision.image",
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
		{ type: "field", key: "imageId" },
		{ type: "field", key: "productId" },
		{ type: "field", key: "locationId" },
		{ type: "field", key: "projectId" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#4383f3"
	},
	function: async ({ cognigy, config }: IGetProductParams) => {
		const { api } = cognigy;
		const { imageId, locationId, productId, projectId, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		try {
			const response = await axios({
				method: "get",
				url: `https://vision.googleapis.com/v1/projects/${projectId}/locations/${locationId}/products/${productId}/referenceImages/${imageId}?key=${key}`,
				headers: {
					"Content-Type": "application/json"
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