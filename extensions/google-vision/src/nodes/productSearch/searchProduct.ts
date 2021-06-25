import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetProductParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		imageSource: string;
		gcsImageUri: string;
		content: string;
		featureMaxResults: number;
		productSet: string;
		productCategories: string[];
		filter: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getProductNode = createNodeDescriptor({
	type: "getProduct",
	defaultLabel: "Get Product",
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
			key: "imageSource",
			label: "Image Source",
			description: "The source of the image that should be used for the product search",
			type: "select",
			params: {
				required: true,
				options: [
					{
						label: "URL",
						value: "url"
					},
					{
						label: "Base64",
						value: "base64"
					}
				]
			},
		},
		{
			key: "gcsImageUri",
			label: "Image URL",
			description: "The URL of the actual image",
			type: "cognigyText",
			params: {
				required: true
			},
			condition: {
				key: "imageSource",
				value: "url"
			}
		},
		{
			key: "content",
			label: "Base64 String",
			description: "The base64 encoded representation of the image",
			type: "cognigyText",
			params: {
				required: true
			},
			condition: {
				key: "imageSource",
				value: "base64"
			}
		},
		{
			key: "featureMaxResults",
			label: "Limit",
			type: "number",
			description: "How many results should be returned",
			defaultValue: 5
		},
		{
			key: "productSet",
			label: "Product Set",
			type: "cognigyText",
			description: "The link to the product set that should be used for the search",
			defaultValue: "projects/{{context.projectId}}/locations/{{context.locationId}}/productSets/{{context.productSetId}}",
			params: {
				required: true
			}
		},
		{
			key: "productCategories",
			label: "Product Categories",
			type: "textArray",
			description: "The list of categories that should be used",
			params: {
				required: true
			}
		},
		{
			key: "filter",
			label: "Filter",
			description: "A data filter such as A1 or F30",
			type: "cognigyText",
			defaultValue: "style=womens OR style=women"
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
			defaultValue: "vision",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "text",
			label: "Context Key to store Result",
			defaultValue: "vision",
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
				"featureMaxResults",
				"filter"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "imageSource" },
		{ type: "field", key: "gcsImageUri" },
		{ type: "field", key: "content" },
		{ type: "field", key: "productSet" },
		{ type: "field", key: "productCategories" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#4383f3"
	},
	function: async ({ cognigy, config }: IGetProductParams) => {
		const { api } = cognigy;
		const { featureMaxResults, gcsImageUri, content, imageSource, productCategories, productSet, filter, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		let image = {};

		switch (imageSource) {
			case "url":
				image = {
					source: {
						gcsImageUri
					}
				};
				break;
			case "base64":
				image = {
					content
				};
				break;
		}
		try {
			const response = await axios({
				method: "post",
				url: `https://vision.googleapis.com/v1/images:annotate?key=${key}`,
				headers: {
					"Content-Type": "application/json"
				},
				data: {
					requests: [
						{
							image,
							features: [
								{
									type: "PRODUCT_SEARCH",
									maxResults: featureMaxResults
								}
							],
							imageContext: {
								productSearchParams: {
									productSet,
									productCategories,
									filter
								}
							}
						}
					]
				}
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data.responses, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data.responses);
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