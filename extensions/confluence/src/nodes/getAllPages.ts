import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { fetchData } from "../knowledge-connectors/helper/utils";

export interface IGetAllPagesParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			domain: string;
			email: string;
			key: string;
		};
		space: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

interface IResultPage {
	id: string;
	type: string;
	status: string;
	title: string;
	webLink: string;
	htmlBody: string;
}

export const getAllPagesNode = createNodeDescriptor({
	type: "getAllPages",
	defaultLabel: "Get All Pages",
	preview: {
		key: "space",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "Confluence Connection",
			type: "connection",
			params: {
				connectionType: "confluence",
				required: true
			}
		},
		{
			key: "space",
			label: "Space Key",
			description: "The key of the Confluence space, such as COG",
			type: "cognigyText",
			params: {
				required: true,
			}
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
			defaultValue: "confluence.pages",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "confluence.pages",
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
		{ type: "field", key: "space" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#0052CC"
	},
	function: async ({ cognigy, config }: IGetAllPagesParams) => {
		const { api } = cognigy;
		const { space, connection, storeLocation, contextKey, inputKey } = config;
		const { domain, email, key } = connection;

		try {
			const response = await fetchData(
				`${domain}/wiki/rest/api/content?type=page&spacekey=${space}&start=0&limit=99999&expand=body.storage`,
				{username: email, password: key}
			);

			// Clean up the result
			const results: IResultPage[] = [];
			response.results.forEach((page: any) => {
				results.push({
					id: page.id,
					type: page.type,
					status: page.status,
					title: page.title,
					webLink: `${domain}/wiki/spaces/${space}/pages/${page.id}`,
					htmlBody: page.body.storage.value
				});
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, results, "simple");
			} else {
				api.addToInput(inputKey, results);
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				api.addToInput(inputKey, error.message);
			}
		}
	}
});
