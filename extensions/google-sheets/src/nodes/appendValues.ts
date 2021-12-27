import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { google } from 'googleapis';
const sheets = google.sheets('v4');

export interface IGetSpreadsheetParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			serviceAccountJSON: string;
		};
		spreadsheetId: string;
		range: string;
		values: any;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const appendValuesNode = createNodeDescriptor({
	type: "appendValues",
	defaultLabel: "Append Values",
	fields: [
		{
			key: "connection",
			label: "Service Account",
			type: "connection",
			params: {
				connectionType: "serviceAccount-connection",
				required: true
			}
		},
		{
			key: "spreadsheetId",
			label: "ID",
			description: "The Spreadsheet ID. One can find the ID in the URL behind spreadsheets",
			type: "cognigyText",
			params: {
				required: true,
			},
		},
		{
			key: "range",
			label: "Range",
			description: "The A1 notation of a range to search for a logical table of data. Values are appended after the last row of the table",
			type: "cognigyText",
			defaultValue: "A2:G30",
			params: {
				required: true
			}
		},
		{
			key: "values",
			label: "Values",
			description: "The list of values that should be added",
			type: "json"
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
			defaultValue: "spreadsheet",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "spreadsheet",
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
		{ type: "field", key: "connection" },
		{ type: "field", key: "spreadsheetId" },
		{ type: "field", key: "range" },
		{ type: "field", key: "values" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#0F9D57"
	},
	function: async ({ cognigy, config }: IGetSpreadsheetParams) => {
		const { api } = cognigy;
		const { spreadsheetId, range, values, connection, storeLocation, contextKey, inputKey } = config;
		let { serviceAccountJSON } = connection;

		serviceAccountJSON = serviceAccountJSON.replace('\n', ' ');
		const serviceAccount = JSON.parse(serviceAccountJSON);

		try {

			const authClient = new google.auth.JWT(
				serviceAccount.client_email,
				null,
				serviceAccount.private_key,
				["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/drive.file",
					"https://www.googleapis.com/auth/spreadsheets"]
			);

			const response = (await sheets.spreadsheets.values.update({
				spreadsheetId,
				valueInputOption: 'USER_ENTERED',
				auth: authClient,
				range,
				requestBody: {
					values: [
						values
					]
				}
			})).data;

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
	}
});