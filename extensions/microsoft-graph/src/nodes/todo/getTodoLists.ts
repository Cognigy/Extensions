import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { Client } from "@microsoft/microsoft-graph-client";
import getAuthenticatedClient from "../../helpers/getAuthenticatedClient";
import "isomorphic-fetch";

export interface IGetTodoListsParams extends INodeFunctionBaseParams {
	config: {
		accessToken: string;
		listId: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getTodoListsNode = createNodeDescriptor({
	type: "getTodoLists",
	defaultLabel: "Get To Do Lists",
	fields: [
		{
			key: "accessToken",
			label: "Microsoft Access Token",
			type: "cognigyText",
			defaultValue: "{{context.microsoft.auth.access_token}}",
			params: {
				required: true,
			}
		},
		{
			key: "listId",
			label: "To Do List ID",
            description: "The ID of the To Do list that should get searched for",
			type: "cognigyText"
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
			defaultValue: "microsoft.todo.lists",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "microsoft.todo.lists",
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
			key: "filter",
			label: "Filter Option",
			defaultCollapsed: true,
			fields: [
				"listId"
			]
		}
	],
	form: [
		{ type: "field", key: "accessToken" },
		{ type: "section", key: "filter" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00a1f1"
	},
	function: async ({ cognigy, config }: IGetTodoListsParams) => {
		const { api } = cognigy;
		const { accessToken, listId, storeLocation, contextKey, inputKey } = config;

		try {
			const client: Client = getAuthenticatedClient(accessToken);
            let path: string = "";

            // Check if filter is provided
            if (listId.length > 0) {
                path = `/me/todo/lists/${listId}`;
            } else {
                path = `/me/todo/lists`;
            }

			const toDoLists = await client.api(path).get();

			if (storeLocation === "context") {
				api.addToContext(contextKey, toDoLists, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, toDoLists);
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