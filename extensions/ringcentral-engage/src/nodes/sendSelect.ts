import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface ISendSelectParams extends INodeFunctionBaseParams {
	config: {
		body: string;
		itemOneLabel: string;
		itemOnePayload: string;
		itemTwoLabel: string;
		itemTwoPayload: string;
		itemThreeLabel: string;
		itemThreePayload: string;
	};
}
export const sendSelectNode = createNodeDescriptor({
	type: "sendSelectRingCentral",
	defaultLabel: "Send Select",
	preview: {
		key: "body",
		type: "text"
	},
	fields: [
		{
			key: "body", // the internal key for this field, has to be unique on the node
			label: "The Body of the Select Message", // label of the field (shows above field)
			type: "cognigyText", // type of field (use ctrl+space for intellisense autosuggestion to see all types)
			defaultValue: "My body", // default value for this field
			params: { // extra parameters which differ by field type
				disabled: false,
				placeholder: "",
				required: true // any field can be made required
			}
		},
		{
			key: "itemOneLabel", // the internal key for this field, has to be unique on the node
			label: "Title", // label of the field (shows above field)
			type: "cognigyText", // type of field (use ctrl+space for intellisense autosuggestion to see all types)
			defaultValue: "Label", // default value for this field
			params: { // extra parameters which differ by field type
				disabled: false,
				placeholder: "",
				required: false // any field can be made required
			}
		},
		{
			key: "itemOnePayload", // the internal key for this field, has to be unique on the node
			label: "Payload", // label of the field (shows above field)
			type: "cognigyText", // type of field (use ctrl+space for intellisense autosuggestion to see all types)
			defaultValue: "Payload", // default value for this field
			params: { // extra parameters which differ by field type
				disabled: false,
				placeholder: "",
				required: false // any field can be made required
			}
		},
		{
			key: "itemTwoLabel", // the internal key for this field, has to be unique on the node
			label: "Title", // label of the field (shows above field)
			type: "cognigyText", // type of field (use ctrl+space for intellisense autosuggestion to see all types)
			defaultValue: "Label", // default value for this field
			params: { // extra parameters which differ by field type
				disabled: false,
				placeholder: "",
				required: false // any field can be made required
			}
		},
		{
			key: "itemTwoPayload", // the internal key for this field, has to be unique on the node
			label: "Payload", // label of the field (shows above field)
			type: "cognigyText", // type of field (use ctrl+space for intellisense autosuggestion to see all types)
			defaultValue: "Payload", // default value for this field
			params: { // extra parameters which differ by field type
				disabled: false,
				placeholder: "",
				required: false // any field can be made required
			}
		},
		{
			key: "itemThreeLabel", // the internal key for this field, has to be unique on the node
			label: "Title", // label of the field (shows above field)
			type: "cognigyText", // type of field (use ctrl+space for intellisense autosuggestion to see all types)
			defaultValue: "Label", // default value for this field
			params: { // extra parameters which differ by field type
				disabled: false,
				placeholder: "",
				required: false // any field can be made required
			}
		},
		{
			key: "itemThreePayload", // the internal key for this field, has to be unique on the node
			label: "Payload", // label of the field (shows above field)
			type: "cognigyText", // type of field (use ctrl+space for intellisense autosuggestion to see all types)
			defaultValue: "Payload", // default value for this field
			params: { // extra parameters which differ by field type
				disabled: false,
				placeholder: "",
				required: false // any field can be made required
			}
		}
	],
	sections: [
		{
			key: "bodySection",
			label: "Body",
			defaultCollapsed: false,
			fields: [
				"body"
			]
		},
		{
			key: "itemOne",
			label: "Item 1",
			defaultCollapsed: true,
			fields: [
				"itemOneLabel",
				"itemOnePayload"
			]
		},
		{
			key: "itemTwo",
			label: "Item 2",
			defaultCollapsed: true,
			fields: [
				"itemTwoLabel",
				"itemTwoPayload"
			]
		},
		{
			key: "itemThree",
			label: "Item 3",
			defaultCollapsed: true,
			fields: [
				"itemThreeLabel",
				"itemThreePayload"
			]
		}
	],
	form: [
		{ type: "section", key: "bodySection" },
		{ type: "section", key: "itemOne" },
		{ type: "section", key: "itemTwo" },
		{ type: "section", key: "itemThree" }
	],
	appearance: {
		color: "#FF8800"
	},
	function: async ({ cognigy, config }: ISendSelectParams) => {
		const { api, input } = cognigy;
		const { body, itemOneLabel, itemOnePayload, itemTwoLabel, itemTwoPayload, itemThreeLabel, itemThreePayload } = config;
		// Send RingCentral Engage Command

		const items = [];

		if (itemOneLabel.length > 0) {
			items.push({
				title: itemOneLabel,
				payload: itemOnePayload
			});
		}
		if (itemTwoLabel.length > 0) {
			items.push({
				title: itemTwoLabel,
				payload: itemTwoPayload
			});
		}
		if (itemThreeLabel.length > 0) {
			items.push({
				title: itemThreeLabel,
				payload: itemThreePayload
			});
		}

		api.say('', {
			_cognigy: {
				_ringCentralEngage: {
					json: {
						command: "structured-content",
						body: body,
						structuredContent: {
							type: "select",
							center_items: true,
							disable_text_input: false,
							items: items
							// items: [
							// 	{
							// 		title: "Billing",
							// 		payload: "I have a question about billing"
							// 	},
							// 	{
							// 		title: "Plans",
							// 		payload: "I want to learn about your plans"
							// 	},
							// 	{
							// 		title: "Device",
							// 		payload: "I have a question about my device"
							// 	}
							// ]
						}
					}
				}
			}
		});
	}
});