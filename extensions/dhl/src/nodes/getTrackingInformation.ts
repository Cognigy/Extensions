import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IgetTrackingInformationParams extends INodeFunctionBaseParams {
	config: {
		apiConnection: {
            apiKey: string;
        };
        trackingNumber: string;
        language: string;
        specifyService: boolean;
        service: string;
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
            label: "DHL API Keys",
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
            label: "Response Language",
            type: "cognigyText",
            description: "Response language for the client in ISO 639-1 two character format (en, de, jp etc.)",
            defaultValue: "en",
            params: {
                required: true
            }
        },
		{
			key: "specifyService",
			label: "Specify DHL Service",
            description: "Specify the specific DHL service the user should be allowed to track.",
			type: "toggle",
			defaultValue: false
		},
        {
			key: "service",
			label: "DHL Service",
			type: "select",
            params: {
				options: [
					{
						label: "Express",
						value: "express"
					},
					{
						label: "Parcel DE",
						value: "parcel-de"
					},
					{
						label: "ecommerce",
						value: "ecommerce"
					},
					{
						label: "DGF",
						value: "dgf"
					},
					{
						label: "Parcel UK",
						value: "parcel-uk"
					},
					{
						label: "Post DE",
						value: "post-de"
					},
					{
						label: "Same day",
						value: "sameday"
					},
					{
						label: "Freight",
						value: "freight"
					},
					{
						label: "Parcel NL",
						value: "parcel-nl"
					},
					{
						label: "Parcel PL",
						value: "parcel-pl"
					},
					{
						label: "DSC",
						value: "dsc"
					}
				]
			},
			defaultValue: "address",
			condition: {
				key: "specifyService",
				value: true
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
        { type: "field", key: "specifyService"},
        { type: "field", key: "service"},
        { type: "section", key: "storageOption"}
    ],
    appearance: {
        color: "#FFCC00"
    },
    function: async ({ cognigy, config }: IgetTrackingInformationParams) => {
        const { api } = cognigy;
        const { apiConnection, trackingNumber, language, specifyService, service, storeLocation, inputKey, contextKey } = config;
        const { apiKey } = apiConnection;

        const endpoint = `https://api-eu.dhl.com/track/shipments`;
        let trackingParameters = {};
        if (specifyService === false) {
            trackingParameters = {
                trackingNumber: trackingNumber,
                language: language
            };
        } else {
            trackingParameters = {
                trackingNumber: trackingNumber,
                language: language,
                service: service
            };
        }
		const axiosConfig: AxiosRequestConfig = {
			params: trackingParameters,
			headers: {
				'DHL-API-Key': apiKey,
			}
		};
    try {
        const result: AxiosResponse = await axios.get(endpoint, axiosConfig);
        const trackingStatusOrig = result.data.shipments[0].status.statusCode;
        let trackingStatusNum;

        switch (trackingStatusOrig) {
            case "pre-transit":
                trackingStatusNum = "0";
                break;
            case "transit":
                trackingStatusNum = "1";
                break;
            case "delivered":
                trackingStatusNum = "2";
                break;
            default:
                trackingStatusNum = "No information available";
        }

        const trackingResults = {
            details: result.data,
            statusNum: trackingStatusNum
        };

        if (storeLocation === 'context') {
            api.addToContext(contextKey, trackingResults, 'simple');
        } else {
            // @ts-ignore
            api.addToInput(inputKey, trackingResults);
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