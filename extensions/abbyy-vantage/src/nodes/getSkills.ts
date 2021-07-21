import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetSkillsParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			instanceUri: string;
		},
		accessToken: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getSkillsAbbyyNode = createNodeDescriptor({
	type: "getSkillsAbbyy",
	defaultLabel: "Get Skills",
	summary: "Retrieves a list of Vantage Skills",
	fields: [
		{
			key: "connection",
			label: "Abbyy Instance",
			type: "connection",
			params: {
				connectionType: "abbyy-instance",
				required: true
			}
		},
		{
			key: "accessToken",
			label: "Access Token",
			type: "cognigyText",
			defaultValue: "{{context.abbyy.auth.access_token}}",
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
			type: "text",
			label: "Input Key to store Result",
			defaultValue: "abbyy.skills",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "text",
			label: "Context Key to store Result",
			defaultValue: "abbyy.skills",
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
		{ type: "field", key: "accessToken" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#ff2038"
	},
	dependencies: {
		children: [
			"onFoundSkills",
			"onNotFoundSkills"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IGetSkillsParams) => {
		const { api } = cognigy;
		const { connection, accessToken, storeLocation, inputKey, contextKey } = config;
		const { instanceUri } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `https://${instanceUri}/api/publicapi/v1/skills`,
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
					"Authorization": `Bearer ${accessToken}`
				}
			});

			if (response.data.length === 0) {
				const onNotFoundSkillsChild = childConfigs.find(child => child.type === "onNotFoundSkills");
				api.setNextNode(onNotFoundSkillsChild.id);
			} else {
				const onFoundSkillsChild = childConfigs.find(child => child.type === "onFoundSkills");
				api.setNextNode(onFoundSkillsChild.id);
			}

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

export const onFoundSkills = createNodeDescriptor({
	type: "onFoundSkills",
	parentType: "authenticateAbbyy",
	defaultLabel: "On Found",
	constraints: {
		editable: false,
		deletable: false,
		creatable: false,
		movable: false,
		placement: {
			predecessor: {
				whitelist: []
			}
		}
	},
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini"
	}
});

export const onNotFoundSkills = createNodeDescriptor({
	type: "onNotFoundSkills",
	parentType: "authenticateAbbyy",
	defaultLabel: "On Not Found",
	constraints: {
		editable: false,
		deletable: false,
		creatable: false,
		movable: false,
		placement: {
			predecessor: {
				whitelist: []
			}
		}
	},
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini"
	}
});