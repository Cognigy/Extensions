import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { Client } from "@microsoft/microsoft-graph-client";
import getAuthenticatedClient from "../../helpers/getAuthenticatedClient";


export interface ISendOutlookMailParams extends INodeFunctionBaseParams {
	config: {
		accessToken: string;
		subject: string;
		message: string;
		recipients: string[];
		carbonCopyRecipients: string[];
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

interface IRecipient {
	emailAddress: {
		address: string;
	};
}

export const sendOutlookMailNode = createNodeDescriptor({
	type: "sendOutlookMail",
	defaultLabel: "Send Mail",
	summary: "Send an Outlook Mail",
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
			key: "subject",
			label: "Subject",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "message",
			label: "Message",
			description: "The HTML message of the mail",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "recipients",
			label: "Recipients",
			description: "A list of email addresses of the recipients",
			type: "textArray"
		},
		{
			key: "carbonCopyRecipients",
			label: "CC Recipients",
			description: "The optional list of email addresses for recipients in CC",
			type: "textArray"
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
			defaultValue: "microsoft.outlook.mail",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "microsoft.outlook.mail",
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
			key: "cc",
			label: "CC",
			defaultCollapsed: true,
			fields: [
				"carbonCopyRecipients"
			]
		}
	],
	form: [
		{ type: "field", key: "accessToken" },
		{ type: "field", key: "subject" },
		{ type: "field", key: "message" },
		{ type: "field", key: "recipients" },
		{ type: "section", key: "cc" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00a1f1"
	},
	function: async ({ cognigy, config }: ISendOutlookMailParams) => {
		const { api } = cognigy;
		const { accessToken, subject, message, recipients, carbonCopyRecipients, storeLocation, contextKey, inputKey } = config;

		// Check if there is a minimum of one recepient configured
		if (recipients.length === 0) {
			throw new Error("Please provide a minimum of one email addresses in the list of recepients.");
		}

		try {
			const client: Client = getAuthenticatedClient(accessToken);

			// Create the list of toRecipients
			let toRecipients: IRecipient[] = [];
			for (let recipient of recipients) {
				toRecipients.push({
					emailAddress: {
						address: recipient
					}
				});
			}

			// Create list of optional CC recipients
			let ccRecipients: IRecipient[] = [];
			if (carbonCopyRecipients.length > 0) {
				for (let ccRecipient of carbonCopyRecipients) {
					ccRecipients.push({
						emailAddress: {
							address: ccRecipient
						}
					});
				}
			}

			await client.api(`/me/sendMail`).post({
				message: {
					subject,
					body: {
						contentType: "HTML",
						content: message
					},
					toRecipients,
					ccRecipients,
				}
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, "success", "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, "success");
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