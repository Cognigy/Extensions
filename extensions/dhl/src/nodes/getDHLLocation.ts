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
        latitude: string;
        longitude: string;
        radius: string;
        limit: string;
        searchType: string;
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
            condition: {
                key: "searchType",
                value: "address"
            }
        },
        {
            key: "postalCode",
            label: "Postal Code",
            type: "cognigyText",
            description: "The postal code where you want to find the DHL location.",
            condition: {
                key: "searchType",
                value: "address"
            }
        },
        {
            key: "addressLocality",
            label: "City/Town",
            type: "cognigyText",
            description: "The city or town where you want to find the DHL location.",
            condition: {
                key: "searchType",
                value: "address"
            }
        },
        {
            key: "countryCode",
            label: "Country Code",
            type: "cognigyText",
            description: "Country where you are looking for the location (GB, DE, JP etc.)",
            condition: {
                key: "searchType",
                value: "address"
            },
            params: {
                required: true
            }
        },
        {
            key: "latitude",
            label: "Latitude",
            type: "cognigyText",
            description: "Latitude of the user's current location",
            condition: {
                key: "searchType",
                value: "geoLocation"
            }
        },
        {
            key: "Longitude",
            label: "longitude",
            type: "cognigyText",
            description: "Longitude of the user's current location",
            condition: {
                key: "searchType",
                value: "geoLocation"
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
			key: "searchType",
			type: "select",
			label: "How to search for the location",
			params: {
				options: [
					{
						label: "Find by address",
						value: "address"
					},
					{
						label: "Find by geo coordinates",
						value: "geoLocation"
					}
				],
				required: true
			},
			defaultValue: "address"
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
        { type: "field", key: "searchType"},
        { type: "field", key: "streetAddress"},
        { type: "field", key: "postalCode"},
        { type: "field", key: "addressLocality"},
        { type: "field", key: "countryCode"},
        { type: "field", key: "longitude"},
        { type: "field", key: "latitude"},
        { type: "field", key: "radius"},
        { type: "field", key: "limit"},
        { type: "section", key: "storageOption"}
    ],
    appearance: {
        color: "#FFCC00"
    },
    function: async ({ cognigy, config }: IgetDHLLocationParams) => {
        const { api } = cognigy;
        const { apiConnection, postalCode, countryCode, storeLocation, streetAddress, addressLocality, latitude, longitude, radius, limit, searchType, inputKey, contextKey } = config;
        const { apiKey } = apiConnection;

        let endpoint;
        let searchParameters = {};
        if (searchType === 'address') {
            endpoint = `https://api.dhl.com/location-finder/v1/find-by-address`;
            searchParameters = {
			    postalCode: postalCode,
                countryCode: countryCode,
                streetAddress: streetAddress,
                addressLocality: addressLocality,
                radius: radius,
                limit: limit
            };
        } else {
            endpoint = `https://api.dhl.com/location-finder/v1/find-by-geo`;
            searchParameters = {
			    latitude: latitude,
                longitude: longitude
		    };
		}
        const axiosConfig: AxiosRequestConfig = {
            params: searchParameters,
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