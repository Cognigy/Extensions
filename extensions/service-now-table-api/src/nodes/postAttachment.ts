import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
import * as http from 'https';


export interface IPostAttachmentParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		tableName: number;
		tableSysId: string;
		fileName: string;
		fileLocation: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const postAttachmentNode = createNodeDescriptor({
	type: "postAttachments",
	defaultLabel: "Post Attachment",
	fields: [
		{
			key: "connection",
			label: "Service Now Connection",
			type: "connection",
			params: {
				connectionType: "snow",
				required: false
			}
		},
		{
			key: "tableName",
			label: "Table Name",
			description: "The name of the Service Now table you want to use for this request.",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "tableSysId",
			label: "Entry Id",
			description: "The id of the entry in the given table where the attachment will be stored.",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "fileName",
			label: "File Name",
			description: "The full filename, e.g. attachment.docx.",
			defaultValue: "attachment.docx",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "fileLocation",
			label: "File Location",
			description: "Where the file is stored now, e.g. AWS S3 bucket etc.",
			defaultValue: "https://path-to-file.docx",
			type: "cognigyText",
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
			defaultValue: "input"
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "snow",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "snow",
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
		{ type: "field", key: "tableName" },
		{ type: "field", key: "tableSysId" },
		{ type: "field", key: "fileName" },
		{ type: "field", key: "fileLocation" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IPostAttachmentParams) => {
		const { api } = cognigy;
		const { connection, tableName, tableSysId, fileName, fileLocation, storeLocation, inputKey, contextKey } = config;
		const { username, password, instance } = connection;

		try {
			const file = await new Promise((resolve) => {
				http.get(fileLocation, (response) => {
					resolve(response);
				});
			});

			const post = await axios.post(`${instance}/api/now/attachment/file`,
				file, {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'multipart/form-data'
				},
				auth: {
					username,
					password
				},
				params: {
					table_name: tableName,
					table_sys_id: tableSysId,
					file_name: fileName
				}
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, post.data.result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, post.data.result);
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error.message }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});