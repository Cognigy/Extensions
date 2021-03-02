import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { Client } from "@microsoft/microsoft-graph-client";
import getAuthenticatedClient from "../helpers/getAuthenticatedClient";
import createAttendeesList from "../helpers/createAttendeesList";


export interface IScheduleMeetingParams extends INodeFunctionBaseParams {
	config: {
		accessToken: string;
		timeZone: string;
		subject: string;
		content: string;
		contentType: string,
		startTime: string,
		endTime: string,
		attendees: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const scheduleMeetingNode = createNodeDescriptor({
	type: "scheduleMeeting",
	defaultLabel: "Schedule Meeting",
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
			key: "timeZone",
			type: "select",
			label: "Time Zone",
			defaultValue: "UTC",
			params: {
				options: [
					{
						label: "UTC",
						value: "UTC"
					},
					{
						label: "PST",
						value: "PST"
					}
				],
				required: true
			},
		},
		{
			key: "subject",
			label: "Subject",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "contentType",
			type: "select",
			label: "Message Type",
			defaultValue: "text",
			params: {
				options: [
					{
						label: "Text",
						value: "text"
					},
					{
						label: "html",
						value: "html"
					}
				],
				required: true
			},
		},
		{
			key: "content",
			label: "Message",
			type: "text",
			params: {
				multiline: true,
				placeholder: "Insert some notes here...",
				required: true
			}
		},
		{
			key: "startTime",
			label: "Start Time",
			description: "The start date and time.",
			type: "cognigyText",
			defaultValue: "2020-09-01T10:00:00",
			params: {
				required: true
			}
		},
		{
			key: "endTime",
			label: "End Time",
			description: "The end date and time.",
			defaultValue: "2020-09-01T11:00:00",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "attendees",
			label: "Attendee",
			description: "The email address of the attendees.",
			type: "cognigyText",
			params: {
				required: false
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
			defaultValue: "microsoft.meeting",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "microsoft.meeting",
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
		}
	],
	form: [
		{ type: "field", key: "accessToken" },
		{ type: "field", key: "timeZone" },
		{ type: "field", key: "subject" },
		{ type: "field", key: "contentType" },
		{ type: "field", key: "content" },
		{ type: "field", key: "startTime" },
		{ type: "field", key: "endTime" },
		{ type: "field", key: "attendees" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00a1f1"
	},
	function: async ({ cognigy, config }: IScheduleMeetingParams) => {
		const { api } = cognigy;
		const { accessToken, timeZone, subject, content, contentType, startTime, endTime, attendees, storeLocation, contextKey, inputKey } = config;

		try {
			const client = getAuthenticatedClient(accessToken);

			const meeting = {
				subject,
				body: {
					contentType,
					content
				},
				start: {
					dateTime: startTime,
					timeZone
				},
				end: {
					dateTime: endTime,
					timeZone
				},
				attendees: createAttendeesList([attendees])
			};


			try {
				const response = await client.api("/me/events").post(meeting);


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