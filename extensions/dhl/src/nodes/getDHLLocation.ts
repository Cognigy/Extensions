import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IgetDHLLocationParams extends INodeFunctionBaseParams {
	config: {
		apiConnection: {
            apiKey: string;
        };
        postalCode: string;
        streetAddress: string;
        addressLocality: string;
        countryCode: string;
        radius: string;
        limit: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
	};
}

export const getDHLLocationNode = createNodeDescriptor({
    type: "getDHLLocation",
    defaultLabel: "Get DHL Location",
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
            key: "streetAddress",
            label: "Street and House Number",
            type: "cognigyText",
            description: "The street and house number for where you want to find the location.",
        },
        {
            key: "postalCode",
            label: "Postal Code",
            type: "cognigyText",
            description: "The postal code where you want to find the DHL location."
        },
        {
            key: "addressLocality",
            label: "City/Town",
            type: "cognigyText",
            description: "The city or town where you want to find the DHL location."
        },
        {
            key: "countryCode",
            label: "Country Code",
            type: "cognigyText",
            description: "Country where you are looking for the location (GB, DE, JP etc.)",
            params: {
                required: true
            }
        },
        {
            key: "radius",
            label: "Search radius in meters",
            type: "cognigyText",
            description: "The radius in meters from the point of origin you wish to search. Maximum 25000 meters.",
            defaultValue: "500",
            params: {
                required: true
            }
        },
        {
            key: "limit",
            label: "limit",
            type: "cognigyText",
            description: "The maximum amount of locations you wish to return. Maximum 50.",
            defaultValue: "15",
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
			defaultValue: "location",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "location",
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
        { type: "field", key: "streetAddress"},
        { type: "field", key: "postalCode"},
        { type: "field", key: "addressLocality"},
        { type: "field", key: "countryCode"},
        { type: "field", key: "radius"},
        { type: "field", key: "limit"},
        { type: "section", key: "storageOption"}
    ],
    appearance: {
        color: "#FFCC00"
    },
    function: async ({ cognigy, config }: IgetDHLLocationParams) => {
        const { api } = cognigy;
        const { apiConnection, postalCode, countryCode, storeLocation, streetAddress, addressLocality, radius, limit, inputKey, contextKey } = config;
        const { apiKey } = apiConnection;

        const endpoint = `https://api.dhl.com/location-finder/v1/find-by-address`;
		const axiosConfig: AxiosRequestConfig = {
			params: {
				postalCode: postalCode,
                countryCode: countryCode,
                streetAddress: streetAddress,
                addressLocality: addressLocality,
                radius: radius,
                limit: limit
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