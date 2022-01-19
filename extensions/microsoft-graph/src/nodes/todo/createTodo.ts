import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { Client } from "@microsoft/microsoft-graph-client";
import getAuthenticatedClient from "../../helpers/getAuthenticatedClient";
import "isomorphic-fetch";

export interface ICreateTodoParams extends INodeFunctionBaseParams {
	config: {
		accessToken: string;
		listId: string;
        title: string;
        importance: 'low' | 'normal' | 'high';
        description: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const createTodoNode = createNodeDescriptor({
	type: "createToDo",
	defaultLabel: "Create To Do",
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
			type: "cognigyText",
            params: {
                required: true
            }
		},
        {
			key: "title",
			label: "Title",
            description: "The title of the task in the To Do list",
			type: "cognigyText",
            params: {
                required: true
            }
		},
        {
			key: "importance",
			label: "Importance",
            description: "The priority of the task",
			type: "select",
            defaultValue: "normal",
            params: {
                options: [
                    {
                        label: "Low",
                        value: "low"
                    },
                    {
                        label: "Normal",
                        value: "normal"
                    },
                    {
                        label: "High",
                        value: "high"
                    }
                ]
            }
		},
        {
			key: "description",
			label: "Description",
            description: "The description of the task. Provide detailed information about what to do",
			type: "cognigyText",
            defaultValue: "",
            params: {
                multiline: true
            }
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
			key: "details",
			label: "Details",
			defaultCollapsed: true,
			fields: [
				"importance",
                "description"
			]
		}
	],
	form: [
		{ type: "field", key: "accessToken" },
		{ type: "field", key: "listId" },
        { type: "field", key: "title" },
        { type: "section", key: "details" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00a1f1"
	},
	function: async ({ cognigy, config }: ICreateTodoParams) => {
		const { api } = cognigy;
		const { accessToken, listId, title, importance, description, storeLocation, contextKey, inputKey } = config;

		try {
			const client: Client = getAuthenticatedClient(accessToken);

			const toDoTask = await client.api(`/me/todo/lists/${listId}/tasks`).post({
                title,
                importance,
                content: description,
                contentType: "html"
            });

			if (storeLocation === "context") {
				api.addToContext(contextKey, toDoTask, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, toDoTask);
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