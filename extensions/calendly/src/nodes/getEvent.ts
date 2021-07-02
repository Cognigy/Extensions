import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetEventParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			personalAccessToken: string;
		};
		eventId: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getEventNode = createNodeDescriptor({
	type: "getEvent",
	defaultLabel: "Get Event",
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
			key: "eventId",
			type: "cognigyText",
			label: "Event ID",
			description: "The ID of the event should be returned",
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
        { type: "field", key: "eventId" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#676B74"
	},
	function: async ({ cognigy, config }: IGetEventParams) => {
		const { api } = cognigy;
		const { connection, eventId, storeLocation, inputKey, contextKey } = config;
		const { personalAccessToken } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `https://api.calendly.com/scheduled_events/${eventId}`,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${personalAccessToken}`
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
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}
	}
});