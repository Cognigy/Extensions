import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

/**
 * This file contains a simple node with many field types, sections, etc
 *
 * It demonstrates how you can write a new flow-node in Cognigy.AI 4.85.0
 * and shows important concepts
 */

export interface IFullExampleParams extends INodeFunctionBaseParams {
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
		connection: { // properly define your connection fields here to access them in your function
			key: string;
		};
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
			description: "A text field with CognigyScript controls",
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
			description: "A simple checkbox",
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
			key: "cognigytextconditional2", // the internal key for this field, has to be unique on the node
			label: "Advanced Conditional: Text with Cognigy Script", // label of the field (shows above field)
			type: "cognigyText", // type of field (use ctrl+space for intellisense autosuggestion to see all types)
			defaultValue: "My default text", // default value for this field
			params: { // extra parameters which differ by field type
				disabled: false,
				placeholder: "",
				required: true// any field can be made required
			},
			condition: { // a nested condition
				// either checkbox and toggle must be on or select must be set to option2
				or: [
					{
						and: [
							{
								key: "checkbox",
								value: true
							},
							{
								key: "toggle",
								value: true
							}
						]
					},
					{
						key: "select",
						value: "option2"
					}
				]
			}
		},
		{
			key: "textarray",
			label: "An array of texts",
			type: "textArray",
			description: "An array of text fields",
			defaultValue: [ // these can be anything, also arrays
				"Text a",
				"Text b"
			]
		},
		{
			key: "chips",
			label: "I contain chips",
			type: "chipInput",
			description: "A field in which a user can press enter to create chips"
		},
		{
			key: "number",
			label: "A number field",
			type: "number",
			params: {
				min: 1000,
				max: 2000
			},
			description: "A number field with min and max values"
		},
		{
			key: "slider",
			label: "A slider",
			type: "slider",
			params: {
				min: 1000,
				max: 2000,
				step: 100
			},
			description: "A number slider with min, max and step values"
		},
		{
			key: "toggle",
			label: "Toggle me",
			type: "toggle",
			defaultValue: true,
			description: "A simple toggle for true/false values"
		},
		{
			key: "date",
			label: "Date Picker",
			type: "date",
			params: {
				locale: "en" // this is a moment.js locale
			},
			description: "A simple date picker"
		},
		{
			key: "datetime",
			label: "Date Time Picker",
			type: "datetime",
			params: {
				locale: "en" // this is a moment.js locale
			},
			description: "A simple date picker with time"
		},
		{
			key: "daterange",
			label: "Date Range Picker",
			type: "daterange",
			params: {
				locale: "en" // this is a moment.js locale
			},
			description: "A simple date range picker"
		},
		{
			key: "timepicker",
			label: "Time Picker",
			type: "time",
			params: {
				locale: "en" // this is a moment.js locale
			},
			description: "A simple time picker"
		},
		{
			key: "json",
			type: "json",
			label: "Json Input",
			defaultValue: {
				"key": "value"
			},
			description: "A code editor for JSON values"
		},
		{
			key: "xml",
			type: "xml",
			label: "Xml Input",
			description: "A code editor for XML values"
		},
		{
			key: "say",
			type: "say",
			label: "A Cognigy Say Control",
			description: "A full Cognigy Say Node field with all of its features",
		},
		{
			key: "connection",
			type: "connection",
			label: "Connection Select",
			params: {
				connectionType: "api-key" // this needs to match the connections 'type' property
			},
			description: "A field to connect against encrypted connections"
		},
		{
			key: "adaptivecard",
			type: "adaptivecard",
			label: "Adaptive Card",
			description: "A code editor for Adaptive Cards with a built-in preview",
			defaultValue: {
				"type": "AdaptiveCard",
				"version": "1.5",
				"body": [
					{
						"type": "ColumnSet",
						"columns": [
							{
								"type": "Column",
								"width": 2,
								"items": [
									{
										"type": "TextBlock",
										"text": "Tell us about yourself",
										"weight": "bolder",
										"size": "medium",
										"wrap": true,
										"style": "heading"
									},
									{
										"type": "TextBlock",
										"text": "We just need a few more details to get you booked for the trip of a lifetime!",
										"isSubtle": true,
										"wrap": true
									},
									{
										"type": "TextBlock",
										"text": "Don't worry, we'll never share or sell your information.",
										"isSubtle": true,
										"wrap": true,
										"size": "small"
									},
									{
										"type": "Input.Text",
										"id": "myName",
										"label": "Your name (Last, First)",
										"isRequired": true,
										"regex": "^[A-Z][a-z]+, [A-Z][a-z]+$",
										"errorMessage": "Please enter your name in the specified format"
									},
									{
										"type": "Input.Text",
										"id": "myEmail",
										"label": "Your email",
										"regex": "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z0-9-]{2,4}$",
										"isRequired": true,
										"errorMessage": "Please enter a valid email address",
										"style": "email"
									},
									{
										"type": "Input.Text",
										"id": "myTel",
										"label": "Phone Number (xxx xxx xxxx)",
										"regex": "^\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$",
										"errorMessage": "Invalid phone number. Please enter a 10 digit phone number",
										"style": "tel"
									}
								]
							},
							{
								"type": "Column",
								"width": 1,
								"items": [
									{
										"type": "Image",
										"url": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Diver_Silhouette%2C_Great_Barrier_Reef.jpg",
										"size": "auto",
										"altText": "Diver in the Great Barrier Reef"
									}
								]
							}
						]
					}
				],
				"actions": [
					{
						"type": "Action.Submit",
						"title": "Submit"
					}
				]
			}
		},
		{
			key: "backgroundSelector",
			type: "backgroundSelector",
			label: "Background Selector",
		},
		{
			key: "select",
			type: "select",
			label: "Select",
			params: {
				options: [
					{
						label: "Option 1",
						value: "option1"
					},
					{
						label: "Option 2",
						value: "option2"
					}
				]
			}
		},
		{
			key: "selectoptionresolver",
			type: "select",
			label: "Select with Option Resolvers",
			description: "Dynmically loads information from an API when the Background Selector above is changed",
			optionsResolver: {
				dependencies: ["backgroundSelector"],
				resolverFunction: async ({ api, config }) => {
				  // fetch list of files using http request
				  const response = await api.httpRequest({
					method: "GET",
					url: `https://swapi.info/api/people/all.json`,
				  });

				  console.log(JSON.stringify(response.data, null, 2));

				  // map file list to "options array"
				  return response.data.map((person) => {
					return {
					  label: person.name,
					  value: person.url,
					};
				  });
				},
			  },
		}
	],
	sections: [ // you can (but don't have to) sort fields into collapsible sections. Sections can also contain conditions.
		{
			key: "basicfields",
			label: "Other Basic Fields",
			defaultCollapsed: false,
			fields: [
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
				"select",
				"number",
				"toggle",
				"slider",
				"backgroundSelector",
				"selectoptionresolver"
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
				"xml",
				"adaptivecard"
			]
		}
	],
	form: [ // if you use sections, you have to use an additional "form" property to describe how the form is rendered.
		{ type: "field", key: "cognigytext" },
		{ type: "section", key: "basicfields" },
		{ type: "section", key: "other" },
		{ type: "section", key: "datepickers" },
		{ type: "section", key: "codefields" },
	],
	function: async ({ cognigy, config }: IFullExampleParams) => {
		// get access to the Cognigy API, Input, Context and Profile from the cognigy object
		const { api, input, context, profile } = cognigy;

		// import config values to access field configuration
		const {
			checkbox,
			cognigytext,
			cognigytextconditional,
			chips,
			connection,
			// ...
		} = config;

		const apikey = connection.key; // access the connection key

		// use the api or any other module to do something
		api.output("This is a simple output message");
	}
});
