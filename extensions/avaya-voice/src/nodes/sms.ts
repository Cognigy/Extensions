import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ISmsParams extends INodeFunctionBaseParams {
	config: {
		to: string;
		text: string;
	};
}

export const smsNode = createNodeDescriptor({
	type: "sms",
	defaultLabel: "Sms",
	fields: [{
		key: "to",
		label: "To",
		type: "cognigyText",
		defaultValue: "{{ci.userId}}",
		params: {
			required: true
		}
	}, {
		key: "text",
		label: "Text",
		type: "cognigyText",
		params: {
			required: true
		}
	}
	],
	form: [{
		type: "field",
		key: "to"
	}, {
		type: "field",
		key: "text"
	}
	],
	function: async ({ cognigy, config }: ISmsParams) => {
		const { api } = cognigy;
		const { to, text } = config;

		if (!to || !text) {
			throw new Error('The parameter to or text is missing.');
		}

		api.output('', {
			"_cognigy": {
				"_spoken": {
					"json": {
						"activities": [{
							"type": "event",
							"name": "sms",
							"activityParams": {
								to,
								text
							}
						}
						]
					}
				}
			}
		});
	}
});
