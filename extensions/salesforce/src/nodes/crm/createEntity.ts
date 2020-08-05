import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const jsforce = require('jsforce');


export interface ICreateEntityParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			token: string;
			loginUrl: string;
		};
		entity: string;
		eventRecord: string;
		accountRecord: string;
		contactRecord: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const createEntityNode = createNodeDescriptor({
	type: "createEntity",
	defaultLabel: "Create Entity - CRM",
	preview: {
		key: "entity",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "Salesforce Credentials",
			type: "connection",
			params: {
				connectionType: "salesforce",
				required: true
			}
		},
		{
			key: "entity",
			label: "Entity Type",
			type: "select",
			defaultValue: "Contact",
			params: {
				options: [
					{
						label: "Contact",
						value: "Contact"
					},
					{
						label: "Event",
						value: "Event"
					},
					{
						label: "Account",
						value: "Account"
					}
				],
				required: true
			},
		},
		{
			key: "contactRecord",
			label: "Contact Record",
			type: "json",
			defaultValue: `{
				"FirstName": "Max",
				"LastName": "Mustermann",
				"Phone": "0221 12345",
				"MobilePhone": "012345678912",
				"Email": "max.mustermann@mail.de",
				"Birthdate": "1994-10-14",
				"MailingCity": "Dusseldorf",
				"MailingStreet": "Speditionsstraße 1",
				"MailingState": "NRW",
				"MailingPostalCode": "40221",
				"MailingCountry": "Germany",
				"Description": "New Contact",
				"Department": "IT"
			}`,
			condition: {
				key: "entity",
				value: "Contact",
			}
		},
		{
			key: "eventRecord",
			label: "Event Record",
			type: "json",
			defaultValue: `{
				"Location": "Dusseldorf",
				"Description": "Eating Stones",
				"Subject": "Event X",
				"ActivityDate": "2019-01-25",
				"DurationInMinutes": "60",
				"ActivityDateTime": "2019-01-25T13:00:00"
			  }`,
			condition: {
				key: "entity",
				value: "Event",
			}
		},
		{
			key: "accountRecord",
			label: "Account Record",
			type: "json",
			defaultValue: `{
				"Name": "Company X",
				"Phone": "0221 12345",
				"BillingCity": "Dusseldorf",
				"BillingStreet": "Speditionsstraße 1",
				"BillingState": "NRW",
				"BillingPostalCode": "40221",
				"BillingCountry": "Germany",
				"Description": "New Contact",
				"Industry": "IT",
				"Website": "www.cognigy.com"
			  }`,
			condition: {
				key: "entity",
				value: "Account",
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
			defaultValue: "contact",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "contact",
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
			key: "connectionSection",
			label: "Connection",
			defaultCollapsed: false,
			fields: [
				"connection",
			]
		}
	],
	form: [
		{ type: "section", key: "connectionSection" },
		{ type: "field", key: "entity" },
		{ type: "field", key: "eventRecord" },
		{ type: "field", key: "accountRecord" },
		{ type: "field", key: "contactRecord" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#009EDB"
	},
	function: async ({ cognigy, config }: ICreateEntityParams) => {
		const { api, input } = cognigy;
		const { entity, eventRecord, accountRecord, contactRecord, connection, storeLocation, contextKey, inputKey } = config;
		const { loginUrl, token, password, username } = connection;

		let record: string = "";
		switch (entity) {
			case 'Contact':
				record = contactRecord;
				break;
			case 'Event':
				record = eventRecord;
				break;
			case 'Account':
				record = accountRecord;
				break
			default:
				record = contactRecord;
		}

		return new Promise((resolve, reject) => {
			let conn = new jsforce.Connection();

			if (loginUrl) {
				conn = new jsforce.Connection({
					loginUrl
				});
			} else {
				conn = new jsforce.Connection();
			}

			conn.login(username, password + token, function (err: any, res: any) {
				if (err) {
					if (storeLocation === "context") {
						api.addToContext(contextKey, err.message, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, err.messgae);
					}
				} else {

					// Single record creation
					conn.sobject(entity).create(record, function (err: any, apiResult: any) {
						if (err) {
							if (storeLocation === "context") {
								api.addToContext(contextKey, err.message, "simple");
							} else {
								// @ts-ignore
								api.addToInput(inputKey, err.message);
							}
						} 

						if (storeLocation === "context") {
							api.addToContext(contextKey, apiResult, "simple");
						} else {
							// @ts-ignore
							api.addToInput(inputKey, apiResult);
						}
					});
				}
			});
		});
	}
});