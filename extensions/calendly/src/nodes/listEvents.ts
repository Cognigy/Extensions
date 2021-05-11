import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IListEventsParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			personalAccessToken: string;
		};
		userId: string;
		inviteeEmail: string;
        status: string;
        minStartTime: string;
        maxStartTime: string;
        count: number
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const listEventsNode = createNodeDescriptor({
	type: "listEvents",
	defaultLabel: "List Events",
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
			key: "inviteeEmail",
			label: "Invitee Email",
			type: "cognigyText",
			description: "Return events that are scheduled with the invitee associated with this email address"
		},
        {
			key: "status",
			label: "Status",
			type: "cognigyText",
            defaultValue: "active",
			description: "Whether the scheduled event is active or canceled"
		},
        {
			key: "minStartTime",
			label: "Minimum Start Time",
			type: "cognigyText",
            defaultValue: "{{input.currentTime.ISODate}}",
			description: "Include events with start times after this time where this time should use the UTC timezone and ISO Format"
		},
        {
			key: "maxStartTime",
			label: "Maximum Start Time",
			type: "cognigyText",
			description: "Include events with start times prior to this time where this time should use the UTC timezone and ISO Format"
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
				"minStartTime",
                "maxStartTime",
                "status"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
        { type: "field", key: "userId" },
		{ type: "section", key: "eventOptions" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#676B74"
	},
	function: async ({ cognigy, config }: IListEventsParams) => {
		const { api } = cognigy;
		const { connection, userId, count, inviteeEmail, maxStartTime, minStartTime, status, storeLocation, inputKey, contextKey } = config;
		const { personalAccessToken } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `https://api.calendly.com/scheduled_events?user=${userId}`,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${personalAccessToken}`
				},
                params: {
                    invitee_email: inviteeEmail ? inviteeEmail : null,
                    status: status ? status : null,
                    count: count ? count : null,
                    min_start_time: minStartTime ? minStartTime : null,
                    max_start_time: maxStartTime ? maxStartTime : null
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