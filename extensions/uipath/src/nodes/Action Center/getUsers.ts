import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IGetUsersParams extends INodeFunctionBaseParams {
	config: {
		authType: string;
		instanceInfo: {
			accountLogicalName: string;
			tenantLogicalName: string;
			clientId: string;
			userKey: string;
		};
		onPremAuthConnection: {
			orchestratorUrl: string;
			tenancyName: string;
			usernameOrEmailAddress: string;
			password: string;
		};
		createQuickReplies: boolean;
		quickReplyText: string;
		fallbackText: string;
		accessToken: string;
		orgUnitId: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getUsersNode = createNodeDescriptor({
	type: "getUsers",
	defaultLabel: "Get Users for Assigning Tasks",
	summary: "Get users who can be assigned tasks.",
	fields: [
		{
			key: "authType",
			label: "Connection Type",
			type: "select",
			description: "Please choose the type of connection",
			params: {
				options: [
					{
						label: "On-premise",
						value: "onPrem"
					},
					{
						label: "Cloud",
						value: "cloud"
					}
				],
				required: true
			},
			defaultValue: "cloud"
		},
		{
			key: "instanceInfo",
			label: "Orchestrator Instance Information",
			type: "connection",
			params: {
				connectionType: 'instanceData',
				required: false
			},
			condition: {
			 	key: "authType",
			 	value: "cloud"
			}
		},
		{
            key: "onPremAuthConnection",
            label: "UiPath On-Prem Connection",
            type: "connection",
            params: {
                 connectionType: "onPremAuth",
                 required: false
            },
			 condition: {
			 	key: "authType",
			 	value: "onPrem"
			}
        },
		{
			key: "createQuickReplies",
			label: "Create Quick Replies",
			type: "toggle",
			description: "Should the agent create a set of quick replies of users to choose?",
			defaultValue: false
		},
		{
			key: "quickReplyText",
			label: "Quick Reply Text",
			type: "cognigyText",
			description: "Text to add before the quick replies",
			params: {
				required: true
			},
			condition: {
				key: "createQuickReplies",
				value: true,
			}
		},
		{
			key: "fallbackText",
			label: "Fallback Text",
			type: "cognigyText",
			description: "Default text if channel not compatible with quick replies",
			condition: {
				key: "createQuickReplies",
				value: true,
			}
		},
		{
			key: "accessToken",
			label: "Access Token",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "orgUnitId",
			label: "Organization Unit ID",
			type: "cognigyText",
			params: {
				required: true
			}
        },
		{
			key: "storeLocation",
			type: "select",
			label: "Where to Store the Result",
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
			label: "Input Key to Store Result",
			defaultValue: "uipath.actionUserList",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uipath.actionUserList",
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
		{ type: "field", key: "authType" },
		{ type: "field", key: "onPremAuthConnection" },
		{ type: "field", key: "instanceInfo" },
		{ type: "field", key: "accessToken" },
		{ type: "field", key: "orgUnitId" },
		{ type: "field", key: "createQuickReplies" },
		{ type: "field", key: "quickReplyText" },
		{ type: "field", key: "fallbackText" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IGetUsersParams) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, orgUnitId, createQuickReplies, quickReplyText, fallbackText, storeLocation, inputKey, contextKey, authType, onPremAuthConnection } = config;

		let endpoint;
		if (authType === 'cloud') {
			const { accountLogicalName, tenantLogicalName } = instanceInfo;
			endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/orchestrator_/odata/tasks/UiPath.Server.Configuration.OData.GetTaskUsers(organizationUnitId=${orgUnitId})`;
	 	} else { // onPrem
			const { orchestratorUrl } = onPremAuthConnection;
			endpoint = `https://${orchestratorUrl}/orchestrator_/odata/tasks/UiPath.Server.Configuration.OData.GetTaskUsers(organizationUnitId=${orgUnitId})`;
		}
		const axiosConfig: AxiosRequestConfig = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'X-UIPATH-OrganizationUnitId': orgUnitId
			}
		};
		try {
			const result: AxiosResponse = await axios.get(endpoint, axiosConfig);

			if (createQuickReplies === true) {
				const listOfUsers = result.data.value;
				let tempUsers = [];
				for (const users of listOfUsers) {
					tempUsers.push(
						{
							"contentType": "postback",
							"payload": `${users.Id}`,
							"title": users.UserName
						}
					);
				}

				api.say("", {
					"_cognigy": {
						"_fallbackText": fallbackText,
						"_default": {
							"_quickReplies": {
								"type": "quick_replies",
								"quickReplies": tempUsers,
								"text": quickReplyText
							}
						}
					}
				});
			}

			if (storeLocation === 'context') {
				api.addToContext(contextKey, result.data, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result.data);
			}
		} catch (error) {
			if (storeLocation === 'context') {
				api.addToContext(contextKey, { error: error.message }, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});