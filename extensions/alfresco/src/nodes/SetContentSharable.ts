import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IsetContentShareableParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			ALF_API_URL: string;
		},
		ContentNodeID: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const setContentShareableNode = createNodeDescriptor({
	type: "setContentShareable",
	defaultLabel: "Set content to be shared",
	summary: "Set the content to be shared and get the sharable ID to allow for download.  This feature requires External User lic from",
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
			key: "ContentNodeID",
			label: "Node ID of the content to be shared",
			type: "cognigyText",
			defaultValue: "{{context.alfresco.ContentNodeID}}",
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
			defaultValue: "alfresco.SharedContent",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "text",
			label: "Context Key to store Result",
			defaultValue: "alfresco.SharedContent",
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
		{ type: "field", key: "ContentNodeID" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#ff2038"
	},
	function: async ({ cognigy, config }: IsetContentShareableParams) => {
		const { api } = cognigy;
		const { connection, ContentNodeID, storeLocation, inputKey, contextKey } = config;
		const { username, password, ALF_API_URL } = connection;
		let aurl = `${ALF_API_URL}/alfresco/api/-default-/public/alfresco/versions/1/nodes/${ContentNodeID}`;
		api.log("debug", JSON.stringify(aurl));
		try {
			const response = await axios({
				method: 'put',
				url: aurl,
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json"
				},
				auth: {
					username,
					password
				},
				data: {
					"aspectNames": [
						"qshare:shared"
					  ]
				}
			});

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
