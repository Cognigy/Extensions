import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IRequestTimeOffParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
			company: string;
		};
		employeeId: number;
		startDate: string;
		endDate: string;
		note: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const requestTimeOffNode = createNodeDescriptor({
	type: "requestTimeOff",
	defaultLabel: "Request Time Off",
	fields: [
		{
			key: "connection",
			label: "Bamboo Connection",
			type: "connection",
			params: {
				connectionType: "bamboo",
				required: true
			}
		},
		{
			key: "employeeId",
			label: "Employee ID",
			type: "number",
			params: {
				required: true
			}
		},
		{
			key: "startDate",
			label: "Start Date",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "endDate",
			label: "End Date",
			type: "cognigyText",
			params: {
				required: false
			}
		},
		{
			key: "note",
			label: "Note",
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
			defaultValue: "bamboo.employees",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "bamboo.employees",
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
		{ type: "field", key: "employeeId" },
		{ type: "field", key: "startDate" },
		{ type: "field", key: "endDate" },
		{ type: "field", key: "note" },
		{ type: "section", key: "storage" },

	],
	appearance: {
		color: "#73C41D"
	},
	function: async ({ cognigy, config }: IRequestTimeOffParams) => {
		const { api } = cognigy;
		const { employeeId, startDate, endDate, note, connection, storeLocation, contextKey, inputKey } = config;
		const { key, company } = connection;

		try {

			const response = await axios({
				method: 'put',
				url: `https://${key}:x@api.bamboohr.com/api/gateway.php/${company}/v1/employees/${employeeId}/time_off/request`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "text/xml"
				},
				data: `<?xml version="1.0" encoding="UTF-8"?>
				<request>
					<status>requested</status>
					<start>${startDate}</start>
					<end>${endDate}</end>
					<timeOffTypeId>1</timeOffTypeId>
					<notes>
						<note from="employee">${note}</note>
					</notes>
				</request> `
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