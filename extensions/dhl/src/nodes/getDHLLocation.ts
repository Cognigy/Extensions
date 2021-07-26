import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';

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
        radius: number;
        limit: number;
        searchType: string;
        specifyServices: boolean;
        services: string[];
        parcelPickUp: boolean;
        parcelDropOff: boolean;
        expressPickUp: boolean;
        expressDropOff: boolean;
        parcelPickUpRegistered: boolean;
        parcelPickUpUnregistered: boolean;
        parcelDropOffUnregistered: boolean;
        letterService: boolean;
        postbank: boolean;
        cashOnDelivery: boolean;
        franking: boolean;
        cashService: boolean;
        packagingMaterial: boolean;
        postIdent: boolean;
        ageVerification: boolean;
        handicappedAccess: boolean;
        parking: boolean;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
	};
}

export const getDHLLocationNode = createNodeDescriptor({
    type: "getDHLLocation",
    defaultLabel: "Get DHL Location",
    summary: "Find DHL locations.",
    preview: {
        key: "searchType",
        type: "text"
    },
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
            key: "longitude",
            label: "Longitude",
            type: "cognigyText",
            description: "Longitude of the user's current location",
            condition: {
                key: "searchType",
                value: "geoLocation"
            }
        },
        {
            key: "radius",
            label: "Search Radius in Meters",
            type: "slider",
            description: "The radius in meters from the point of origin you wish to search. Maximum 25000 meters.",
            defaultValue: 500,
            params: {
                required: true,
                min: 200,
				max: 25000,
				step: 100
            }
        },
        {
            key: "limit",
            label: "Results Limit",
            type: "number",
            description: "The maximum amount of locations you wish to return. Maximum 50.",
            defaultValue: 15,
            params: {
                required: true,
                max: 50
            }
        },
        {
			key: "searchType",
			type: "select",
			label: "Search Type",
			params: {
				options: [
					{
						label: "Address",
						value: "address"
					},
					{
						label: "Geo Coordinates",
						value: "geoLocation"
					}
				],
				required: true
			},
			defaultValue: "address"
		},
        {
			key: "specifyServices",
			type: "toggle",
			label: "Specify Services",
            description: "Filter by the types of services offered at the location.",
			defaultValue: false
		},
        {
			key: "parcelPickUp",
			type: "checkbox",
			label: "Parcel Pick-Up",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "parcelDropOff",
			type: "checkbox",
			label: "Parcel Drop-Off",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "expressPickUp",
			type: "checkbox",
			label: "Express Pick-Up",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "expressDropOff",
			type: "checkbox",
			label: "Express Drop-Off",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "parcelPickUpRegistered",
			type: "checkbox",
			label: "Parcel Pick-Up Registered",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "parcelPickUpUnregistered",
			type: "checkbox",
			label: "Parcel Pick-Up Unregistered",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "parcelDropOffUnregistered",
			type: "checkbox",
			label: "Parcel Drop-Off Unregistered",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "letterService",
			type: "checkbox",
			label: "Letter Service",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "postbank",
			type: "checkbox",
			label: "Postbank",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "cashOnDelivery",
			type: "checkbox",
			label: "Cash on Delivery",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "franking",
			type: "checkbox",
			label: "Franking",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "cashService",
			type: "checkbox",
			label: "Cash Service",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "packagingMaterial",
			type: "checkbox",
			label: "Packaging Material",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "postIdent",
			type: "checkbox",
			label: "Postident",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "ageVerification",
			type: "checkbox",
			label: "Age Verification",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "handicappedAccess",
			type: "checkbox",
			label: "Handicapped Access",
			defaultValue: false,
            condition: {
                key: "specifyServices",
                value: true
            }
		},
        {
			key: "parking",
			type: "checkbox",
			label: "Parking",
			defaultValue: false,
            condition: {
                key: "specifyServices",
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
			defaultValue: "dhlLocations",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "dhlLocations",
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
        { type: "field", key: "specifyServices"},
        { type: "field", key: "parcelPickUp"},
        { type: "field", key: "parcelDropOff"},
        { type: "field", key: "expressPickUp"},
        { type: "field", key: "expressDropOff"},
        { type: "field", key: "parcelPickUpRegistered"},
        { type: "field", key: "parcelPickUpUnregistered"},
        { type: "field", key: "parcelDropOffUnregistered"},
        { type: "field", key: "letterService"},
        { type: "field", key: "postbank"},
        { type: "field", key: "cashOnDelivery"},
        { type: "field", key: "franking"},
        { type: "field", key: "cashService"},
        { type: "field", key: "packagingMaterial"},
        { type: "field", key: "postIdent"},
        { type: "field", key: "ageVerification"},
        { type: "field", key: "handicappedAccess"},
        { type: "field", key: "parking"},
        { type: "section", key: "storageOption"}
    ],
    appearance: {
        color: "#FFCC00"
    },
    function: async ({ cognigy, config }: IgetDHLLocationParams) => {
        const { api } = cognigy;
        const { apiConnection, postalCode, countryCode, storeLocation, streetAddress, addressLocality, latitude, longitude, radius, limit, specifyServices, parcelPickUp, parcelDropOff, expressPickUp, expressDropOff, parcelPickUpRegistered,
            parcelPickUpUnregistered, parcelDropOffUnregistered, letterService, postbank, cashOnDelivery, franking, cashService, packagingMaterial, postIdent, ageVerification, handicappedAccess, parking, searchType, inputKey, contextKey } = config;
        const { apiKey } = apiConnection;

        const services = [];
        if (parcelPickUp === true) {
            services.push("parcel:pick-up");
        }
        if (parcelDropOff === true) {
            services.push("parcel:drop-off");
        }
        if (expressPickUp === true) {
            services.push("express:pick-up");
        }
        if (expressDropOff === true) {
            services.push("express:drop-off");
        }
        if (parcelPickUpRegistered === true) {
            services.push("parcel:pick-up-registered");
        }
        if (parcelPickUpUnregistered === true) {
            services.push("parcel:pick-up-unregistered");
        }
        if (parcelDropOffUnregistered === true) {
            services.push("parcel:drop-off-unregistered");
        }
        if (letterService === true) {
            services.push("letter-service");
        }
        if (postbank === true) {
            services.push("postbank");
        }
        if (cashOnDelivery === true) {
            services.push("cash-on-delivery");
        }
        if (franking === true) {
            services.push("franking");
        }
        if (cashService === true) {
            services.push("cash-service");
        }
        if (packagingMaterial === true) {
            services.push("packaging-material");
        }
        if (postIdent === true) {
            services.push("postident");
        }
        if (ageVerification === true) {
            services.push("age-verification");
        }
        if (handicappedAccess === true) {
            services.push("handicapped-access");
        }
        if (parking === true) {
            services.push("parking");
        }

        let endpoint;
        let searchParameters = {};
        if (searchType === 'address') {
            endpoint = `https://api.dhl.com/location-finder/v1/find-by-address`;
            if (specifyServices === true) {
                searchParameters = {
                    postalCode: postalCode,
                    countryCode: countryCode,
                    streetAddress: streetAddress,
                    addressLocality: addressLocality,
                    radius: radius,
                    limit: limit,
                    serviceType: services
                };
            } else {
                searchParameters = {
                    postalCode: postalCode,
                    countryCode: countryCode,
                    streetAddress: streetAddress,
                    addressLocality: addressLocality,
                    radius: radius,
                    limit: limit
                };
            }
        } else {
            endpoint = `https://api.dhl.com/location-finder/v1/find-by-geo`;
            if (specifyServices === true) {
                searchParameters = {
                    latitude: latitude,
                    longitude: longitude,
                    radius: radius,
                    limit: limit,
                    serviceType: services
                };
            } else {
                searchParameters = {
                    latitude: latitude,
                    longitude: longitude,
                    radius: radius,
                    limit: limit
                };
            }
		}
        const axiosConfig: AxiosRequestConfig = {
            params: searchParameters,
            paramsSerializer: params => {
                return qs.stringify(params, {arrayFormat: "repeat"});
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