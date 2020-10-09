import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const request = require('request-promise-native');

export interface IGetReleasesParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			client_id: string;
			refresh_token: string;
			account_logical_name: string;
			service_instance_logical_name: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getReleasesNode = createNodeDescriptor({
	type: "getReleases",
	defaultLabel: "Get Releases",
	fields: [
		{
			key: "connection",
			label: "UIPath Connection",
			type: "connection",
			params: {
				connectionType: "uipath",
				required: true
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
			defaultValue: "uipath",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uipath",
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
		{ type: "field", key: "filter" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#f56105"
	},
	function: async ({ cognigy, config }: IGetReleasesParams) => {
		const { api } = cognigy;
		const { connection, storeLocation, contextKey, inputKey } = config;
		const { client_id, refresh_token, account_logical_name, service_instance_logical_name } = connection;

		// Always return a Promise
		// A resolved Promise MUST return the input object
		// A rejected Promise will stop Flow execution and show an error in the UI, but not the channel
		return new Promise((resolve, reject) => {

			let response;
			// if there is an error, handle it according to the best practice guide

			let accessToken;

			let options = {
				method: 'POST',
				uri: 'https://account.uipath.com/oauth/token',
				body: {
					grant_type: "refresh_token",
					client_id,
					refresh_token
				},
				json: true // Automatically stringifies the body to JSON
			};

			request(options)
				.then((parsedBody): any => {
					response = parsedBody;
					accessToken = parsedBody.access_token;

					let finalOptions = {
						method: 'GET',
						url: `https://platform.uipath.com/${account_logical_name}/${service_instance_logical_name}/odata/Releases`,
						headers: {
							'Content-Type': 'application/json',
							'X-UIPATH-TenantName': service_instance_logical_name
						},
						auth: {
							'bearer': accessToken
						},
						json: true
					};

					request(finalOptions)
						.then((jobs) => {
							if (storeLocation === "context") {
								api.addToContext(contextKey, jobs, "simple");
							} else {
								// @ts-ignore
								api.addToInput(inputKey, jobs);
							}

						})
						.catch((err) => {
							if (storeLocation === "context") {
								api.addToContext(contextKey, err, "simple");
							} else {
								// @ts-ignore
								api.addToInput(inputKey, err);
							}
						});
				})
				.catch((err) => {
					if (storeLocation === "context") {
						api.addToContext(contextKey, err, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, err);
					}
				});
		});
	}
});