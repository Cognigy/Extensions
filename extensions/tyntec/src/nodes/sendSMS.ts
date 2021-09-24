import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";


export interface ISendSMSParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		from: string;
		to: string;
		message: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const sendSMSNode = createNodeDescriptor({
	type: "sendSMS",
	defaultLabel: "Send SMS",
	fields: [
		{
			key: "connection",
			label: "Tyntec Connection",
			type: "connection",
			params: {
				connectionType: "tyntec",
				required: true
			}
		},
		{
			key: "from",
			label: "From",
			type: "cognigyText",
			defaultValue: "Cognigy",
			params: {
				required: true
			}
		},
		{
			key: "to",
			label: "To",
			type: "cognigyText",
			description: "The receiver telephone number, starting with the country code such as +49 or +43",
			params: {
				required: true
			}
		},
		{
			key: "message",
			label: "Message",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
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
			defaultValue: "input"
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "tyntec.sms",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "tyntec.sms",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storageOption",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "from" },
		{ type: "field", key: "to" },
		{ type: "field", key: "message" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#ffb04c"
	},
	dependencies: {
		children: [
			"onSuccessSMS",
			"onErrorSMS"
		]
	},
	function: async ({ cognigy, config, childConfigs }: ISendSMSParams) => {
		const { api } = cognigy;
		const { connection, from, to, message, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		try {
			const response = await axios({
				method: "post",
				url: " https://api.tyntec.com/messaging/v1/sms",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"apikey": key
				},
				data: {
					from,
					to,
					message
				}
			});

			const onSuccessChild = childConfigs.find(child => child.type === "onSuccessSMS");
			api.setNextNode(onSuccessChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}
		} catch (error) {

			const onErrorChild = childConfigs.find(child => child.type === "onErrorSMS");
			api.setNextNode(onErrorChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});

export const onSuccessSMS = createNodeDescriptor({
    type: "onSuccessSMS",
    parentType: "sendSMS",
    defaultLabel: "On Success",
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onErrorSMS = createNodeDescriptor({
    type: "onErrorSMS",
    parentType: "sendSMS",
    defaultLabel: "On Error",
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});