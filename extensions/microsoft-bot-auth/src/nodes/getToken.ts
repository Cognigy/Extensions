import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ConnectorClient, MicrosoftAppCredentials } from "botframework-connector";

export interface IgetTokenParams extends INodeFunctionBaseParams {
	config: {
		apiConnection: {
            appId: string;
            appPassword: string;
        };
        storeLocation: string;
        inputKey: string;
        contextKey: string;
	};
}

export const getTokenNode = createNodeDescriptor({
    type: "getToken",
    defaultLabel: "Get Token",
    fields: [
        {
            key: "apiConnection",
            label: "Your Bot Authentication Credentials",
            type: "connection",
            description: "Bot App ID and Password",
            params: {
                connectionType: 'microsoftBotCredentials',
                required: true
            }
        },
        {
			key: "storeLocation",
			type: "select",
			label: "Where to Store the Result",
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
			label: "Input Key to Store Result",
			defaultValue: "microsoftToken",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "microsoftToken",
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
        { type: "field", key: "apiConnection"},
        { type: "field", key: "contentUrl"},
        { type: "section", key: "storageOption"}
    ],
    appearance: {
        color: "#ed1d24"
    },
    function: async ({ cognigy, config }: IgetTokenParams) => {
        const { api } = cognigy;
        const { apiConnection, storeLocation, inputKey, contextKey } = config;
        const { appId, appPassword } = apiConnection;

        let credentials = await new MicrosoftAppCredentials(appId, appPassword).getToken();

    try {
        if (storeLocation === 'context') {
            api.addToContext(contextKey, credentials, 'simple');
        } else {
            // @ts-ignore
            api.addToInput(inputKey, credentials);
        }
    } catch (error) {
        if (storeLocation === 'context') {
            api.addToContext(contextKey, { error: error.message }, 'simple');
        } else {
            // @ts-ignore
            api.addToInput(inputKey, { error: error.message });
        }
    }
}
});