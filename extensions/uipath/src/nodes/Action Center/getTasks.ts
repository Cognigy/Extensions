import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IGetTasksParams extends INodeFunctionBaseParams {
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
		accessToken: string;
		specifyOrgUnit: boolean;
		statusFilter: boolean;
		taskStatus: string;
		orgUnitId: string;
		createQuickReplies: boolean;
		quickReplyText: string;
		includeDeleted: boolean;
		fallbackText: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getTasksNode = createNodeDescriptor({
	type: "getTasks",
	defaultLabel: "Get Tasks",
	summary: "Get a list of tasks which can be filtered by status.",
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
			key: "accessToken",
			label: "Access Token",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "statusFilter",
			label: "Filter by Status",
			type: "toggle",
			description: "Filter tasks by status",
			defaultValue: false
		},
		{
			key: "taskStatus",
			label: "Status of Task",
			type: "select",
			params: {
				options: [
					{
						label: "Unassigned",
						value: "Unassigned"
					},
					{
						label: "Pending",
						value: "Pending"
					},
					{
						label: "Completed",
						value: "Completed"
					}
				]
			},
			condition: {
				key: "statusFilter",
				value: true,
			}
		},
		{
			key: "specifyOrgUnit",
			label: "Specify Organization Unit",
			type: "toggle",
			description: "Only list tasks from a specific organization unit",
			defaultValue: false
		},
		{
			key: "orgUnitId",
			label: "Organization Unit ID",
			type: "cognigyText",
			params: {
				required: true
			},
			condition: {
				key: "specifyOrgUnit",
				value: true,
			}
        },
		{
			key: "createQuickReplies",
			label: "Create Quick Replies",
			type: "toggle",
			description: "Should the agent create a set of quick replies of tasks to choose?",
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
			key: "includeDeleted",
			label: "Include Deleted Tasks",
			type: "toggle",
			description: "Should deleted tasks be included in the list?",
			defaultValue: false
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
			defaultValue: "uipath.taskList",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uipath.taskList",
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
		{ type: "field", key: "statusFilter" },
		{ type: "field", key: "taskStatus" },
		{ type: "field", key: "createQuickReplies" },
		{ type: "field", key: "quickReplyText" },
		{ type: "field", key: "fallbackText" },
		{ type: "field", key: "specifyOrgUnit" },
		{ type: "field", key: "orgUnitId" },
		{ type: "field", key: "includeDeleted" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IGetTasksParams) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, statusFilter, taskStatus, specifyOrgUnit, orgUnitId, createQuickReplies, quickReplyText, fallbackText, includeDeleted, storeLocation, inputKey, contextKey, authType, onPremAuthConnection } = config;

		let endpoint;
		let headerInfo;
		let configInfo;
		if (authType === 'cloud') {
			const { accountLogicalName, tenantLogicalName } = instanceInfo;
			endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Tasks/UiPath.Server.Configuration.OData.GetTasksAcrossFolders`;
	 	} else { // onPrem
			const { orchestratorUrl } = onPremAuthConnection;
			endpoint = `https://${orchestratorUrl}/odata/Tasks/UiPath.Server.Configuration.OData.GetTasksAcrossFolders`;
		}

		if (specifyOrgUnit === true) {
			headerInfo = {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
				'X-UIPATH-OrganizationUnitId': orgUnitId
			};
		} else {
			headerInfo = {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`
			};
		}

		if (statusFilter === true) {
			if (includeDeleted === true) {
				configInfo = {
					headers: headerInfo,
					params: {
						$filter: `Status eq '${taskStatus}'`
					}
				};
			} else {
				configInfo = {
					headers: headerInfo,
					params: {
						$filter: `Status eq '${taskStatus}' and IsDeleted eq false`
					}
				};
			}
		} else {
			if (includeDeleted === true) {
				configInfo = {
					headers: headerInfo
				};
			} else {
				configInfo = {
					headers: headerInfo,
					params: {
						$filter: `IsDeleted eq false`
					}
				};
			}
		}

		const axiosConfig: AxiosRequestConfig = configInfo;
		try {
			const result: AxiosResponse = await axios.get(endpoint, axiosConfig);

			if (createQuickReplies === true) {
				const listOfTasks = result.data.value;
				let tempTasks = [];
				for (const tasks of listOfTasks) {
					tempTasks.push(
						{
							"contentType": "postback",
							"payload": `${tasks.Id}`,
							"title": tasks.Title
						}
					);
				}

				api.say("", {
					"_cognigy": {
						"_fallbackText": fallbackText,
						"_default": {
							"_quickReplies": {
								"type": "quick_replies",
								"quickReplies": tempTasks,
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