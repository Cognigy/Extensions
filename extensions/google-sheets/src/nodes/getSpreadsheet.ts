import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { google } from 'googleapis';
const sheets = google.sheets('v4');

export interface IGetSpreadsheetParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			serviceAccountJSON: string;
		};
		connectionType: string;
		spreadsheetId: string;
		range: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getSpreadsheetNode = createNodeDescriptor({
	type: "getSpreadsheet",
	defaultLabel: "Get Spreadsheet",
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
			description: "A data range such as A1 or F30",
			type: "cognigyText",
			defaultValue: "A2:G30"
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
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#0F9D57"
	},
	function: async ({ cognigy, config }: IGetSpreadsheetParams) => {
		const { api } = cognigy;
		const { spreadsheetId, connection, range, storeLocation, contextKey, inputKey } = config;
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

			const response = (await sheets.spreadsheets.values.get({
				spreadsheetId,
				auth: authClient,
				range
			}));

			if (storeLocation === "context") {
				api.addToContext(contextKey, response, "simple");
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