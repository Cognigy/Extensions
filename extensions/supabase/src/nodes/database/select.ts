import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { createClient } from '@supabase/supabase-js';

export interface ISelectParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			supabaseUrl: string;
			supabaseKey: string;
		}
		table: string;
		specifyFields: boolean;
		fields: string[];
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const selectNode = createNodeDescriptor({
	type: "select",
	defaultLabel: "Select (Database)",
	summary: "Select rows from a database table",
	fields: [
		{
			key: "connection",
			label: "Supabase Connection",
			type: "connection",
			params: {
				connectionType: "supabase",
				required: true
			}
		},
		{
			key: "table",
			label: "table",
			type: "cognigyText",
			description: "The name of the database table",
			params: {
				required: true
			}
		},
		{
			key: "specifyFields",
			label: "Specify Fields",
			type: "toggle",
			description: "Wether to specify fields that should be returned from a row or not",
			defaultValue: false
		},
		{
			key: "fields",
			label: "Fields",
			type: "textArray",
			description: "A list of fields that should be returned for each row",
			condition: {
				key: "specifyFields",
				value: true
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
			defaultValue: "database",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "database",
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
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"specifyFields",
				"fields"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "table" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#266f4e"
	},
	function: async ({ cognigy, config }: ISelectParams) => {
		const { api } = cognigy;
		const { connection, table, specifyFields, fields, storeLocation, contextKey, inputKey } = config;
		const { supabaseKey, supabaseUrl } = connection;

		try {

			const supabase = createClient(supabaseUrl, supabaseKey);

			if (specifyFields) {
				const { data, error } = await supabase
					.from(table)
					.select(fields.join(", "));

				if (storeLocation === "context") {
					api.addToContext(contextKey, data, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, data);
				}
			} else {
				const { data, error } = await supabase
					.from(table)
					.select();

				if (storeLocation === "context") {
					api.addToContext(contextKey, data, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, data);
				}
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