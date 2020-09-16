import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import nodemailer = require('nodemailer');
import validateEmail from "../helpers/validateEmail";

export interface ISendEmailWithAttachmentParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			host: string;
			port: string;
			security: string;
			user: string;
			password: string;
		};
		fromName: string,
		fromEmail: string,
		to: string,
		subject: string,
		message: string
		attachmentName?: string,
		attachmentUrl?: string,
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const sendEmailWithAttachmentNode = createNodeDescriptor({
	type: "sendEmailWithAttachment",
	defaultLabel: "Send Email With Attachment",
	fields: [
		{
			key: "connection",
			label: "SMTP Connection",
			type: "connection",
			params: {
				connectionType: "smtp",
				required: true
			}
		},
		{
			key: "fromName",
			label: "Sender Name",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "fromEmail",
			label: "Sender E-Mail",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "to",
			label: "Receiver E-Mail",
			type: "cognigyText",
			params: {
				required: true
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
			type: "text",
			params: {
				required: true,
				multiline: true,
				placeholder: `Hello,

How are you today?

Best Regards,
Cognigy
				`
			}
		},
		{
			key: "attachmentName",
			label: "Name",
			type: "cognigyText",
			params: {
				placeholder: "myFile.pdf",
				required: false
			}
		},
		{
			key: "attachmentUrl",
			label: "Url",
			type: "cognigyText",
			params: {
				placeholder: "https://www.website.com/myFile.pdf",
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
			defaultValue: "cognigy",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "cognigy",
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
			key: "attachment",
			label: "Attachment",
			defaultCollapsed: false,
			fields: [
				"attachmentName",
				"attachmentUrl"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "fromName" },
		{ type: "field", key: "fromEmail" },
		{ type: "field", key: "to" },
		{ type: "field", key: "subject" },
		{ type: "field", key: "message" },
		{ type: "section", key: "attachment" },
		{ type: "section", key: "storage" },
	],
	function: async ({ cognigy, config }: ISendEmailWithAttachmentParams) => {
		const { api } = cognigy;
		let { connection, fromEmail, fromName, to, subject, message, attachmentName, attachmentUrl, storeLocation, contextKey, inputKey } = config;
		const { host, port, security, user, password } = connection;

		// checking arguments
		if (!fromName) throw new Error('No `from` name defined. This could be the name of your company or your employee, for example.');
		if (!fromEmail) throw new Error('No `from` email address defined.');
		if (!to) throw new Error('No `to` email address defined. You can provide a list of email addresses by just adding them like this: test@test.de, mail@mail.de, ...');
		if (!subject) subject = "";
		if (!message) message = "";

		// check the attachment argument information
		if (attachmentName && !attachmentUrl) throw new Error('You have to define both attachment information. You forgot to define the attachment URL');
		if (!attachmentName && attachmentUrl) throw new Error('You have to define both attachment information. You forgot to define the attachment name');

		// checking secret information
		if (!host) throw new Error('No email host defined. This could be something like smtp.example.com.');
		if (!port) throw new Error('No email port defined. This could be something like 587 or 465.');
		if (!security) throw new Error('No email security option defined. This could be TLS, STARTTLS or NONE.');
		if (!['TLS', 'STARTTLS', 'NONE'].includes(security.trim().toUpperCase())) {
			throw new Error('Invalid email security option defined. This could be TLS, STARTTLS or NONE.');
		}
		if (!user) throw new Error('No email user defined. This is your email username.');
		if (!password) throw new Error('No email password defined. This is your email password.');

		// validate the given email addresses.
		const fromMailValidation = validateEmail(fromEmail);
		if (!fromMailValidation) throw new Error(`The email ${fromEmail} is not valid. Please check it.`);

		for (let em of to.split(',')) {
			let toMailValidation = validateEmail(em.trim());
			if (!toMailValidation) throw new Error(`The email ${em} is not valid. Please check it.`);
		}


		try {

			// create reusable transporter object using the default SMTP transport
			const transporter = nodemailer.createTransport({
				host,
				port,
				secure: security === 'TLS',
				ignoreTLS: security === 'NONE',
				auth: {
					user,
					pass: password
				}
			});

			// send mail with defined transport object
			const info = await transporter.sendMail({
				from: `"${fromName}" <${fromEmail}>`,
				to,
				subject,
				html: message,
				attachments: [
					{
						filename: attachmentName,
						path: attachmentUrl
					},
				]
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, `Message sent: ${info.messageId}`, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, `Message sent: ${info.messageId}`);
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