import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IDetectJailbreakParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
            contentSafetyEndpoint: string;
		};
		text: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const detectJailbreakNode = createNodeDescriptor({
	type: "detectJailbreak",
	defaultLabel: "Detect Jailbreak",
	fields: [
		{
			key: "connection",
			label: "Content Safety API Key",
			type: "connection",
			params: {
				connectionType: "content-safety",
				required: true
			}
		},
		{
			key: "text",
			label: "Text",
			type: "cognigyText",
			description: "The text that should be checked",
			defaultValue: "{{input.text}}",
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
			defaultValue: "microsoft.azure.contentSafety",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "microsoft.azure.contentSafety",
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
		{ type: "field", key: "text" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#007fff"
	},
    dependencies: {
		children: [
            "onJailbreakDetected",
			"onNoJailbreakDetected"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IDetectJailbreakParams) => {
		const { api } = cognigy;
		const { connection, text, storeLocation, inputKey, contextKey } = config;
		const { key, contentSafetyEndpoint } = connection;

		try {
			const response = await axios({
				method: "POST",
				url: `${contentSafetyEndpoint}contentsafety/text:detectJailbreak?api-version=2023-10-15-preview`,
				headers: {
					'Ocp-Apim-Subscription-Key': key,
					'Content-Type': 'application/json'
				},
                data: {
                    text
                }
			});

			if (response?.data?.jailbreakAnalysis?.detected) {
				const onJailbreakDetected = childConfigs.find(child => child.type === "onJailbreakDetected");
				api.setNextNode(onJailbreakDetected.id);
			} else {
				const onNoJailbreakDetected = childConfigs.find(child => child.type === "onNoJailbreakDetected");
				api.setNextNode(onNoJailbreakDetected.id);
			}

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

            const onNoJailbreakDetected = childConfigs.find(child => child.type === "onNoJailbreakDetected");
            api.setNextNode(onNoJailbreakDetected.id);
		}
	}
});

export const onJailbreakDetected = createNodeDescriptor({
	type: "onJailbreakDetected",
	parentType: "detectJailbreak",
	defaultLabel: {
		default: "Detected"
	},
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

export const onNoJailbreakDetected = createNodeDescriptor({
	type: "onNoJailbreakDetected",
	parentType: "detectJailbreak",
	defaultLabel: {
		default: "Else"
	},
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

