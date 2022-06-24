import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetUserActivityParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			ALF_API_URL: string;
		},
		UserID: string;
		skipCount: string;
		no_results: string;
		siteId: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getUserActivityNode = createNodeDescriptor({
	type: "getUserActivity",
	defaultLabel: "Get User Activity",
	summary: "Retrieves a list of user's activity",
	fields: [
		{
			key: "connection",
			label: "Alfresco Repository",
			type: "connection",
			params: {
				connectionType: "alfresco-instance",
				required: true
			}
		},
		{
			key: "UserID",
			label: "User ID",
			type: "cognigyText",
			defaultValue: "{{context.alfresco.UserID}}",
			params: {
				required: true
			}
		},
		{
			key: "skipCount",
			label: "Start Count (skipCount)",
			type: "cognigyText",
			defaultValue: "0",
			params: {
				required: true
			}
		},
		{
			key: "no_results",
			label: "No. of Results (maxItems)",
			type: "cognigyText",
			defaultValue: "100",
			params: {
				required: true
			}
		},
		{
			key: "siteId",
			label: "Site ID",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: false
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
			defaultValue: "alfresco.UserActivities",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "text",
			label: "Context Key to store Result",
			defaultValue: "alfresco.UserActivities",
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
		{ type: "field", key: "UserID" },
		{ type: "field", key: "skipCount" },
		{ type: "field", key: "no_results" },
		{ type: "field", key: "siteId" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#ff2038"
	},
	dependencies: {
		children: [
			"onFoundUserActivity",
			"onNotFoundUserActivity"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IGetUserActivityParams) => {
		const { api } = cognigy;
		const { connection, UserID, skipCount, no_results, siteId, storeLocation, inputKey, contextKey } = config;
		const { username, password, ALF_API_URL } = connection;
		let aurl = `${ALF_API_URL}/alfresco/api/-default-/public/alfresco/versions/1/people/${UserID}/activities?skipCount=${skipCount}&maxItems=${no_results}`;
		if (siteId !== "") {
			aurl = `${ALF_API_URL}/alfresco/api/-default-/public/alfresco/versions/1/people/${UserID}/activities?skipCount=${skipCount}&maxItems=${no_results}&siteId=${siteId}`;
		}
		api.log("debug", JSON.stringify(aurl));
		try {
			const response = await axios({
				method: 'get',
				url: aurl,
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				auth: {
					username,
					password
				}
			});
			if (response.data.length === 0) {
				const onNotFoundUserActivity = childConfigs.find(child => child.type === "onNotFoundUserActivity");
				api.setNextNode(onNotFoundUserActivity.id);
			} else {
				const onFoundUserActivity = childConfigs.find(child => child.type === "onFoundUserActivity");
				api.setNextNode(onFoundUserActivity.id);
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

export const onFoundUserActivity = createNodeDescriptor({
	type: "onFoundUserActivity",
	parentType: "getUserActivity",
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

export const onNotFoundUserActivity = createNodeDescriptor({
	type: "onNotFoundUserActivity",
	parentType: "getUserActivity",
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