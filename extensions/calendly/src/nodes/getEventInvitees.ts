import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetEventInviteesParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			personalAccessToken: string;
		};
		eventId: string;
		inviteeEmail: string;
        status: string;
        count: number
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getEventInviteesNode = createNodeDescriptor({
	type: "getEventInviteees",
	defaultLabel: "Get Event Invitees",
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
			description: "The ID of the event which invitees should be returned",
            params: {
                required: true
            }
		},
		{
			key: "inviteeEmail",
			label: "Invitee Email",
			type: "cognigyText",
			description: "Indicates if the results should be filtered by email address"
		},
        {
			key: "status",
			label: "Status",
			type: "cognigyText",
            defaultValue: "active",
			description: "Whether the scheduled event is active or canceled"
		},
        {
			key: "count",
			label: "Limit",
			type: "number",
			description: "The number of events to return",
            defaultValue: 20
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
		},
        {
			key: "eventOptions",
			label: "Event Options",
			defaultCollapsed: true,
			fields: [
                "count",
				"inviteeEmail",
                "status"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
        { type: "field", key: "eventId" },
		{ type: "section", key: "eventOptions" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#676B74"
	},
	function: async ({ cognigy, config }: IGetEventInviteesParams) => {
		const { api } = cognigy;
		const { connection, eventId, count, inviteeEmail, status, storeLocation, inputKey, contextKey } = config;
		const { personalAccessToken } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `https://api.calendly.com/scheduled_events/${eventId}/invitees`,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${personalAccessToken}`
				},
                params: {
                    email: inviteeEmail ? inviteeEmail : null,
                    status: status ? status : null,
                    count: count ? count : null
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