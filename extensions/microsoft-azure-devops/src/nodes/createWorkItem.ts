import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api';
import { Operation } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';

const WORK_ITEM_TYPE = {
	BUG: 'Bug',
	FEATURE: 'User Story',
	TASK: 'Task'
};

export interface ITranslateTextParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			token: string;
			organizationUrl: string;
			projectId: string;
		};
		title: string;
		description: string;
		type: keyof typeof WORK_ITEM_TYPE;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const createWorkItemNode = createNodeDescriptor({
	type: "createWorkItem",
	defaultLabel: "Create Work Item",
	fields: [
		{
			key: "connection",
			label: "Personal Access Token",
			type: "connection",
			params: {
				connectionType: "azure-devops",
				required: true
			}
		},
		{
			key: "title",
			label: "Title",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "type",
			label: "Type",
			type: "select",
			params: {
				required: true,
				options: [
					{
						label: "Bug",
						value: "BUG"
					},
					{
						label: "Feature",
						value: "FEATURE"
					},
					{
						label: "Task",
						value: "TASK"
					}
				]
			}
		},
		{
			key: "description",
			label: "Description",
			type: "cognigyText",
			params: {
				required: true,
				multiline: true
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
			defaultValue: "devops.workItem",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "devops.workItem",
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
		{ type: "field", key: "type" },
		{ type: "field", key: "title" },
		{ type: "field", key: "description" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#0067b5"
	},
	function: async ({ cognigy, config }: ITranslateTextParams) => {
		const { api } = cognigy;
		const { connection, type, title, description, storeLocation, inputKey, contextKey } = config;
		const { token, organizationUrl, projectId } = connection;

		try {

			const authHandler = getPersonalAccessTokenHandler(token);
			const azureConnection = new WebApi(organizationUrl, authHandler);
			const workItemApi = await azureConnection.getWorkItemTrackingApi();

			const response = await workItemApi.createWorkItem(
				{},
				[
					{
						op: Operation.Add,
						path: "/fields/System.Title",
						from: null,
						value: title
					},
					{
						op: Operation.Add,
						path: "/fields/System.Description",
						from: null,
						value: description
					}
				],
				projectId,
				type
			);

			if (storeLocation === "context") {
				api.addToContext(contextKey, response, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response);
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