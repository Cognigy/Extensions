import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ICreateFolderParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			ALF_API_URL: string;
		},
		ContentNodeID: string;
		FolderName: string;
		FolderTitle: string;
		description: string;
		incfields: string;
		Includes: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const CreateFolderNode = createNodeDescriptor({
	type: "CreateFolderNode",
	defaultLabel: "Create Folder",
	summary: "Create a Folder into the repository.",
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
			label: "Parent Node ID to place the folder into",
			type: "cognigyText",
			defaultValue: "{{context.alfresco.ContentNodeID}}",
			params: {
				required: true
			}
		},
		{
			key: "FolderName",
			type: "cognigyText",
			label: "Folder Name.",
			defaultValue: ``,
			params: {
				required: true
			}
		},
		{
			key: "FolderTitle",
			type: "cognigyText",
			label: "Folder Title.",
			defaultValue: ``,
			params: {
				required: false
			}
		},
		{
			key: "description",
			type: "cognigyText",
			label: "Folder description.",
			defaultValue: ``,
			params: {
				required: false
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
			defaultValue: "alfresco.CreateFolder",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "text",
			label: "Context Key to store Result",
			defaultValue: "alfresco.CreateFolder",
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
		{ type: "field", key: "FolderName" },
		{ type: "field", key: "FolderTitle" },
		// { type: "field", key: "relativePath" },
		{ type: "field", key: "description" },
		{ type: "field", key: "incfields" },
		{ type: "field", key: "Includes" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#ff2038"
	},
	function: async ({ cognigy, config }: ICreateFolderParams) => {
		const { api } = cognigy;
		const { connection, ContentNodeID, FolderName, FolderTitle, description, incfields, Includes, storeLocation, inputKey, contextKey } = config;
		const { username, password, ALF_API_URL } = connection;
		let aurl = `${ALF_API_URL}/alfresco/api/-default-/public/alfresco/versions/1/nodes/${ContentNodeID}/children`;
		if (Includes !== "") {
			aurl = aurl.concat(`&include=${Includes}`);
		}
		if (incfields !== "") {
			aurl = aurl.concat(`&fields=${incfields}`);
		}
		api.log("debug", JSON.stringify(aurl));
		try {
			const response = await axios({
				method: 'post',
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
					"name": FolderName,
					"nodeType": "cm:folder",
					"properties":
					{
						"cm:title": FolderTitle,
						"cm:description": description
					}
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
