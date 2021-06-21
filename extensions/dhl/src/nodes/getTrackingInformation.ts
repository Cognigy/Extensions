import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IgetTrackingInformationParams extends INodeFunctionBaseParams {
	config: {
		apiConnection: {
            apiKey: string;
        };
        trackingNumber: string;
        language: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
	};
}

export const getTrackingInformationNode = createNodeDescriptor({
    type: "getTrackingInformation",
    defaultLabel: "Get Tracking Information",
    fields: [
        {
            key: "apiConnection",
            label: "Your API Keys",
            type: "connection",
            description: "API authentication information for DHL",
            params: {
                connectionType: 'dhl',
                required: true
            }
        },
        {
            key: "trackingNumber",
            label: "Tracking Number",
            type: "cognigyText",
            description: "Tracking number for the delivery you wish to see.",
            params: {
                required: true
            }
        },
        {
            key: "language",
            label: "Response language",
            type: "cognigyText",
            description: "Response language for the client in ISO 639-1 two character format (en, de, jp etc.)",
            defaultValue: "en",
            params: {
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
			defaultValue: "trackingInfo",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "trackingInfo",
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
        { type: "field", key: "trackingNumber"},
        { type: "field", key: "language"},
        { type: "section", key: "storageOption"}
    ],
    appearance: {
        color: "#FFCC00"
    },
    function: async ({ cognigy, config }: IgetTrackingInformationParams) => {
        const { api } = cognigy;
        const { apiConnection, trackingNumber, language, storeLocation, inputKey, contextKey } = config;
        const { apiKey } = apiConnection;

        const endpoint = `https://api-eu.dhl.com/track/shipments`;
		const axiosConfig: AxiosRequestConfig = {
			params: {
				trackingNumber: trackingNumber,
                language: language
			},
			headers: {
				'DHL-API-Key': apiKey,
			}
		};
    try {
        const result: AxiosResponse = await axios.get(endpoint, axiosConfig);
        if (storeLocation === 'context') {
            api.addToContext(contextKey, result.data, 'simple');
        } else {
            // @ts-ignore
            api.addToInput(inputKey, result.data);
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