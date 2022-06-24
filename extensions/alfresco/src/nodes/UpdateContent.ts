import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IUpdateContentParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			ALF_API_URL: string;
		},
		ContentNodeID: string;
		nodeBodyUpdate: object;
		incfields: string;
		Includes: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const UpdateContentNode = createNodeDescriptor({
	type: "UpdateContentNode",
	defaultLabel: "Update content",
	summary: "Update the content related information, like Aspects and properties.",
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
			label: "Node ID of the content to be updated",
			type: "cognigyText",
			defaultValue: "{{context.alfresco.ContentNodeID}}",
			params: {
				required: true
			}
		},
		{
			key: "nodeBodyUpdate",
			type: "json",
			label: "The node information to update.",
			defaultValue: `{}`,
			params: {
				required: true
			}
		},
		{
			key: "incfields",
			label: "Fields:  Return only these fields.  (ex: Name,createdByUser)",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: false
			}
		},
		{
			key: "Includes",
			label: "Include: Returns additional information about the node (allowableOperations, aspectNames,isLink,isFavorite,isLocked,path,properties)",
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
			defaultValue: "alfresco.UpdateContent",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "text",
			label: "Context Key to store Result",
			defaultValue: "alfresco.UpdateContent",
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
		{ type: "field", key: "nodeBodyUpdate" },
		{ type: "field", key: "incfields" },
		{ type: "field", key: "Includes" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#ff2038"
	},
	function: async ({ cognigy, config }: IUpdateContentParams) => {
		const { api } = cognigy;
		const { connection, ContentNodeID, nodeBodyUpdate, incfields, Includes, storeLocation, inputKey, contextKey } = config;
		const { username, password, ALF_API_URL } = connection;
		let aurl = `${ALF_API_URL}/alfresco/api/-default-/public/alfresco/versions/1/nodes/${ContentNodeID}`;
		if (Includes !== "") {
			aurl = aurl.concat(`&include=${Includes}`);
		}
		if (incfields !== "") {
			aurl = aurl.concat(`&fields=${incfields}`);
		}
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
				data: nodeBodyUpdate
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
