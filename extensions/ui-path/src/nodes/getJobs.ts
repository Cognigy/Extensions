import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const request = require('request-promise-native');

export interface IGetJobsParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			userKey: string;
			accountLogicalName: string;
			tenantName: string;
			clientId: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getJobsNode = createNodeDescriptor({
	type: "getJobs",
	defaultLabel: "Get Jobs",
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
	function: async ({ cognigy, config }: IGetJobsParams) => {
		const { api } = cognigy;
		const { connection, storeLocation, contextKey, inputKey } = config;
		const { userKey, accountLogicalName, tenantName, clientId } = connection;

		// Always return a Promise
		// A resolved Promise MUST return the input object
		// A rejected Promise will stop Flow execution and show an error in the UI, but not the channel
		return new Promise((resolve, reject) => {
			let result = {};
			let response;
			// if there is an error, handle it according to the best practice guide

			let accessToken;

			let options = {
				method: 'POST',
				uri: 'https://account.uipath.com/oauth/token',
				body: {
					grant_type: "refresh_token",
					client_id: clientId,
					refresh_token: userKey
				},
				json: true // Automatically stringifies the body to JSON
			};

			request(options)
				.then( (parsedBody): any => {
					response = parsedBody;
					accessToken = parsedBody.access_token;

					let finalOptions = {
						method: 'GET',
						url: `https://cloud.uipath.com/${accountLogicalName}/${tenantName}/odata/Jobs`,
						headers: {
							'Content-Type': 'application/json',
							'X-UIPATH-TenantName': tenantName
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

							return;
						})
						.catch((err) => {
							if (storeLocation === "context") {
								api.addToContext(contextKey, err, "simple");
							} else {
								// @ts-ignore
								api.addToInput(inputKey, err);
							}

							return;
						});

				})
				.catch((err) => {
					if (storeLocation === "context") {
						api.addToContext(contextKey, err, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, err);
					}

					return;
				});
		});
	}
});