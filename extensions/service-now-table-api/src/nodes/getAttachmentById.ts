import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IGetAttachmentByIdParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		sysId: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getAttachmentsByIdNode = createNodeDescriptor({
	type: "getAttachmentsById",
	defaultLabel: "Get Attachments By ID",
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
			key: "sysId",
			label: "Attachment Id",
			description: "The id of the attachment you want to reach.",
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
		{ type: "field", key: "sysId" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IGetAttachmentByIdParams) => {
		const { api } = cognigy;
		const { connection, sysId, storeLocation, inputKey, contextKey } = config;
		const { username, password, instance } = connection;

		try {
			const response = await axios.get(`${instance}/api/now/attachment/${sysId}`, {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				auth: {
					username,
					password
				},
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data.result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data.result);
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