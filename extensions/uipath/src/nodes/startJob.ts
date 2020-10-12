import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const request = require('request-promise-native');

export interface IStartJobParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			userKey: string;
			accountLogicalName: string;
			tenantName: string;
			clientId: string;
		};
		releaseKey: string;
		strategy: string;
		robotId: string;
		inputArguments: any;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const startJobNode = createNodeDescriptor({
	type: "startJob",
	defaultLabel: "Start Job",
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
			key: "releaseKey",
			label: "Release Key",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "strategy",
			type: "select",
			label: "Job Strategy",
			defaultValue: "input",
			params: {
				options: [
					{
						label: "Specific",
						value: "Specific"
					},
					{
						label: "All",
						value: "All"
					}
				],
				required: true
			},
		},
		{
			key: "robotId",
			label: "Robot ID",
			description: "The ID of the robot that needs to be triggered",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "inputArguments",
			label: "Input Arguments",
			type: "json",
			defaultValue: "{}",
			params: {
				required: false
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
			defaultValue: "uipath.job",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uipath.job",
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
				"inputArguments"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "releaseKey" },
		{ type: "field", key: "robotId" },
		{ type: "field", key: "strategy" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#f56105"
	},
	function: async ({ cognigy, config }: IStartJobParams) => {
		const { api } = cognigy;
		const { releaseKey, robotId, strategy, inputArguments, connection, storeLocation, contextKey, inputKey } = config;
		const { userKey, accountLogicalName, tenantName, clientId } = connection;

		try {
			const authResponse = await request({
				method: 'POST',
				uri: 'https://account.uipath.com/oauth/token',
				body: {
					grant_type: "refresh_token",
					client_id: clientId,
					refresh_token: userKey
				},
				json: true // Automatically stringifies the body to JSON
			});

			const { access_token } = authResponse;

			try {
				const response = await request({
					method: 'POST',
					url: `https://platform.uipath.com/${accountLogicalName}/${tenantName}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`,
					headers: {
						'Content-Type': 'application/json',
						'X-UIPATH-TenantName': tenantName
					},
					auth: {
						'bearer': access_token
					},
					body: {
						"startInfo":
						{
							"ReleaseKey": releaseKey,
							"Strategy": strategy,
							"RobotIds": [Number.parseInt(robotId)],
							"NoOfRobots": 0,
							"InputArguments": JSON.stringify(inputArguments)
						}
					},
					json: true
				});

				if (storeLocation === "context") {
					api.addToContext(contextKey, response, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, response);
				}
			} catch (error) {
				if (storeLocation === "context") {
					api.addToContext(contextKey, error, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, error);
				}
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}
	}
});