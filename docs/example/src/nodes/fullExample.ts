import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

/**
 * This file contains a simple node with many field types, sections, etc
 *
 * It demonstrates how you can write a new flow-node in Cognigy.AI 4.0.0
 * and shows important concepts
 */

export interface IReverseSayParams extends INodeFunctionBaseParams {
	config: {
		cognigytext: string;
		textarray: string[];
		checkbox: boolean;
		cognigytextconditional: string;
		chips: string[];
		number: number;
		slider: number;
		toggle: boolean;
		date: string;
		datetime: string;
		daterange: string;
		timepicker: string;
		json: any;
		xml: any;
		say: any;
		connection: any;
	};
}

export const fullExample = createNodeDescriptor({
	type: "fullExample",
	defaultLabel: "Full Example",
	preview: {
		key: "cognigytext",
		type: "text"
	},
	fields: [
		{
			key: "cognigytext", // the internal key for this field, has to be unique on the node
			label: "Some text with CognigyScript", // label of the field (shows above field)
			type: "cognigyText", // type of field (use ctrl+space for intellisense autosuggestion to see all types)
			defaultValue: "My default text", // default value for this field
			params: { // extra parameters which differ by field type
				disabled: false,
				placeholder: "",
				required: true// any field can be made required
			}
		},
		{
			key: "checkbox",
			label: "Check me to show another text field",
			type: "checkbox",
			defaultValue: false
		},
		{
			key: "cognigytextconditional", // the internal key for this field, has to be unique on the node
			label: "Conditional: Text with Cognigy Script", // label of the field (shows above field)
			type: "cognigyText", // type of field (use ctrl+space for intellisense autosuggestion to see all types)
			defaultValue: "My default text", // default value for this field
			params: { // extra parameters which differ by field type
				disabled: false,
				placeholder: "",
				required: true// any field can be made required
			},
			condition: { // this condition has to evaluate to true in order for the field to show
				key: "checkbox", // the field key to search for (here: the checkbox above)
				value: true // the value the condition field (checkbox) has to have for this field to show. Can be boolean, string, number.
			}
		},
		{
			key: "textarray",
			label: "An array of texts",
			type: "textArray",
			defaultValue: [ // these can be anything, also arrays
				"Text a",
				"Text b"
			]
		},
		{
			key: "chips",
			label: "I contain chips",
			type: "chipInput"
		},
		{
			key: "number",
			label: "A number field",
			type: "number",
			params: {
				min: 1000,
				max: 2000
			}
		},
		{
			key: "slider",
			label: "A slider",
			type: "slider",
			params: {
				min: 1000,
				max: 2000,
				step: 100
			}
		},
		{
			key: "toggle",
			label: "Toggle me",
			type: "toggle",
			defaultValue: true
		},
		{
			key: "date",
			label: "Date Picker",
			type: "date",
			params: {
				locale: "en" // this is a moment.js locale
			}
		},
		{
			key: "datetime",
			label: "Date Time Picker",
			type: "datetime",
			params: {
				locale: "en" // this is a moment.js locale
			}
		},
		{
			key: "daterange",
			label: "Date Range Picker",
			type: "daterange",
			params: {
				locale: "en" // this is a moment.js locale
			}
		},
		{
			key: "timepicker",
			label: "Time Picker",
			type: "time",
			params: {
				locale: "en" // this is a moment.js locale
			}
		},
		{
			key: "json",
			type: "json",
			label: "Json Input",
			defaultValue: {
				"key": "value"
			}
		},
		{
			key: "xml",
			type: "xml",
			label: "Xml Input",
		},
		{
			key: "say",
			type: "say",
			label: "A Cognigy Say Control"
		},
		{
			key: "connection",
			type: "connection",
			label: "Connection Select",
			params: {
				connectionType: "api-key" // this needs to match the connections 'type' property
			}
		}
	],
	sections: [ // you can (but don't have to) sort fields into collapsible sections. Sections can also contain conditions.
		{
			key: "textfields",
			label: "Text Fields",
			defaultCollapsed: false,
			fields: [
				"cognigytext",
				"checkbox",
				"cognigytextconditional",
				"textarray",
				"chips",
				"say"
			]
		},
		{
			key: "other",
			label: "Other Fields",
			defaultCollapsed: true,
			fields: [
				"number",
				"toggle",
				"slider"
			]
		},
		{
			key: "datepickers",
			label: "Date Pickers",
			defaultCollapsed: true,
			fields: [
				"date",
				"datetime",
				"daterange",
				"timepicker"
			]
		},
		{
			key: "codefields",
			label: "Code Fields",
			defaultCollapsed: true,
			fields: [
				"json",
				"xml"
			]
		}
	],
	form: [ // if you use sections, you have to use an additional "form" property to describe how the form is rendered.
		{ type: "section", key: "textfields" },
		{ type: "section", key: "other" },
		{ type: "section", key: "datepickers" },
		{ type: "section", key: "codefields" },
	]
});
