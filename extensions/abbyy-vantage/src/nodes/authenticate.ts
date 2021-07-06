import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IAuthenticateParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			clientId: string;
			clientSecret: string;
			url: string;
			username: string;
			password: string;
		};
		scope: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const authenticateAbbyyNode = createNodeDescriptor({
	type: "authenticateAbbyy",
	defaultLabel: "Authenticate",
	summary: "Creates a Bearer Access Token",
	fields: [
		{
			key: "connection",
			label: "Abbyy Connection",
			type: "connection",
			params: {
				connectionType: "abbyy-oauth",
				required: true
			}
		},
		{
			key: "scope",
			label: "scope",
			type: "cognigyText",
			defaultValue: "openid permissions",
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
			defaultValue: "context"
		},
		{
			key: "inputKey",
			type: "text",
			label: "Input Key to store Result",
			defaultValue: "abbyy.auth",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "text",
			label: "Context Key to store Result",
			defaultValue: "abbyy.auth",
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
		{ type: "field", key: "scope" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#ff2038"
	},
	dependencies: {
		children: [
			"onSuccessAuth",
			"onErrorAuth"
		]
	},
	tokens: [
		{
			label: "Abbyy Access Token",
			script: "context.abbyy.auth.access_token",
			type: "answer"
		}
	],
	function: async ({ cognigy, config, childConfigs }: IAuthenticateParams) => {
		const { api } = cognigy;
		const { connection, scope, storeLocation, inputKey, contextKey } = config;
		const { clientId, clientSecret, url, username, password } = connection;

		try {
			const response = await axios({
				method: 'post',
				url,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				data: `grant_type=password&scope=${scope}&username=${username}&password=${password}&client_id=${clientId}&client_secret=${clientSecret}`
			});

			const onSuccessChild = childConfigs.find(child => child.type === "onSuccessAuth");
			api.setNextNode(onSuccessChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}
		} catch (error) {

			const onErrorChild = childConfigs.find(child => child.type === "onErrorAuth");
			api.setNextNode(onErrorChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});

export const onSuccessAuth = createNodeDescriptor({
    type: "onSuccessAuth",
    parentType: "authenticateAbbyy",
    defaultLabel: "On Success",
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

export const onErrorAuth = createNodeDescriptor({
    type: "onErrorAuth",
    parentType: "authenticateAbbyy",
    defaultLabel: "On Failed",
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
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});