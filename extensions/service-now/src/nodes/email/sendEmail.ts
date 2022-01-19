import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface ISendEmailParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		to: string[];
        subject: string;
		cc: string[];
		bcc: string[];
		html: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

interface IEmailData {
	cc: string[];
	bcc: string[];
	html: string;
	to: string[];
    subject: string;
}

export const sendEmailNode = createNodeDescriptor({
	type: "sendEmail",
	defaultLabel: "Send Email",
	summary: "Sends a new mail with Service Now",
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
			key: "to",
			label: "To",
			description: "The receiver email addresses",
			type: "textArray"
		},
        {
            key: "subject",
            label: "Subject",
            description: "The email's subject",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
			key: "cc",
			label: "CC",
			description: "A list of CC email addresses",
			type: "textArray"
		},
        {
			key: "bcc",
			label: "BCC",
			description: "A list of BCC email addresses",
			type: "textArray"
		},
        {
			key: "html",
			label: "Message",
			description: "The email message in HTML format",
			type: "cognigyText",
            params: {
                multiline: true,
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
			defaultValue: "snow.email",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "snow.email",
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
			key: "optional",
			label: "Optional",
			defaultCollapsed: true,
			fields: [
				"cc",
				"bcc"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "to" },
        { type: "field", key: "subject" },
		{ type: "field", key: "html" },
        { type: "section", key: "optional" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: ISendEmailParams) => {
		const { api } = cognigy;
		const { connection, to, subject, cc, bcc, html, storeLocation, inputKey, contextKey } = config;
		const { username, password, instance } = connection;

		try {

			const data: IEmailData = {
				to,
                subject,
                cc,
                bcc,
                html
			};

			const response = await axios.post(`${instance}/api/now/v1/email`,
				data, {
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
				api.addToContext(contextKey, { error: error }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error });
			}
		}
	}
});