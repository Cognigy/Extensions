import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetSpreadsheetParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		spreadsheetId: string;
		sheetName: string;
		filter: string;
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
			label: "API Key",
			type: "connection",
			params: {
				connectionType: "google-cloud-connection",
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
			key: "sheetName",
			label: "Sheet Name",
			description: "The name of he sheet that includes the table data",
			type: "cognigyText",
			params: {
				required: true,
			},
		},
		{
			key: "filter",
			label: "Filter",
			description: "A data filter such as A1 or F30",
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
		{ type: "field", key: "sheetName" },
		{ type: "field", key: "filter" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#0F9D57"
	},
	function: async ({ cognigy, config }: IGetSpreadsheetParams) => {
		const { api } = cognigy;
		const { spreadsheetId, sheetName, filter, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!${filter}?key=${key}`,
				headers: {
					'Content-Type': 'application/json'
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
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});