import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetAccountStatusParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			clientId: string;
			clientSecret: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const checkLiveAgentAvailabilityNode = createNodeDescriptor({
	type: "checkLiveAgentAvailability",
	defaultLabel: "Check Agent Availability",
	summary: "Checks if an agent is available in Zendesk Chat",
	fields: [
		{
			key: "connection",
			label: "Zendesk Chat Connection",
			type: "connection",
			params: {
				connectionType: "zendesk-chat",
				required: true
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
			defaultValue: "zendesk.liveAgentAvailability",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "zendesk.liveAgentAvailability",
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
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00363d"
	},
	dependencies: {
		children: [
			"onAgentAvailable",
			"onNoAgentAvailable"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IGetAccountStatusParams) => {
		const { api } = cognigy;
		const { connection, storeLocation, contextKey, inputKey } = config;
		const { clientId, clientSecret } = connection;

		try {

			const tokenPayload = `client_id=${clientId}`
			+ `&grant_type=client_credentials`
			+ `&client_secret=${clientSecret}`;

			const authResponse = await axios({
				method: "post",
				url: "https://www.zopim.com/oauth2/token",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				data: tokenPayload,
			});

			const response = await axios({
				method: "get",
				url: `https://rtm.zopim.com/stream/agents`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authResponse.data.access_token}`
				},
			});

			if (response.data?.content?.data?.agents_online === 0) {
                const onOfflineChild = childConfigs.find(child => child.type === "onNoAgentAvailable");
                api.setNextNode(onOfflineChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response.data, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response.data);
                }
            } else {
                const onAvailableChild = childConfigs.find(child => child.type === "onAgentAvailable");
                api.setNextNode(onAvailableChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response.data, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response.data);
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

export const onAgentAvailable = createNodeDescriptor({
    type: "onAgentAvailable",
    parentType: "checkLiveAgentAvailability",
    defaultLabel: "On Online",
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

export const onNoAgentAvailable = createNodeDescriptor({
    type: "onNoAgentAvailable",
    parentType: "checkLiveAgentAvailability",
    defaultLabel: "On Offline",
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