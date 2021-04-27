import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetEventTypesParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			personalAccessToken: string;
		};
		userId: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getEventTypesNode = createNodeDescriptor({
	type: "getEventTypes",
	defaultLabel: "Get Event Types",
	fields: [
		{
			key: "connection",
			label: "Calendly PAT Connection",
			type: "connection",
			params: {
				connectionType: "calendryAccessToken",
				required: true
			}
		},
        {
			key: "userId",
			type: "cognigyText",
			label: "User URI",
			description: "Return events that are scheduled with the user associated with this URI",
            defaultValue: "https://api.calendly.com/users/EBHAAFHDCAEQTSEZ",
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
			defaultValue: "calendly",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "calendly",
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
        { type: "field", key: "userId" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#676B74"
	},
	function: async ({ cognigy, config }: IGetEventTypesParams) => {
		const { api } = cognigy;
		const { connection, userId, storeLocation, inputKey, contextKey } = config;
		const { personalAccessToken } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `https://api.calendly.com/event_types?user=${userId}`,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${personalAccessToken}`
				},
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