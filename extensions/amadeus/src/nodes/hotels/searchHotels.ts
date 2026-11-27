import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';

export interface ISearchHotelsParams extends INodeFunctionBaseParams {
    config: {
        oauth2Connection: {
            apiUrl: string;
            clientId: string;
            clientSecret: string;
        };
        searchOption: string;
        cityCode: string;
        radius: number;
        radiusUnit: string;
        latitude: number;
        longitude: number;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const searchHotelsNode = createNodeDescriptor({
    type: "searchHotels",
    defaultLabel: "Search Hotels",
    summary: "Searches for hotels",
    fields: [
        {
            key: "oauth2Connection",
            label: "Amadeus OAuth2",
            type: "connection",
            description: "Amadeus OAuth2 Connection",
            params: {
                connectionType: 'amadeus-oauth2',
                required: true
            }
        },
        {
            key: "searchOption",
            label: "Search by",
            type: "select",
            defaultValue: "city",
            params: {
                required: true,
                options: [
                    {
                        label: "City",
                        value: "city"
                    },
                    {
                        label: "Geocode",
                        value: "geocode"
                    }
                ]
            }
        },
        {
            key: "cityCode",
            label: "City Code",
            type: "cognigyText",
            description: "Destination city code or airport code, such as PAR.",
            params: {
                required: true
            },
            condition: {
                key: "searchOption",
                value: "city"
            }
        },
        {
            key: "radius",
            label: "Radius",
            type: "cognigyText",
            defaultValue: "5",
            description: "Maximum distance from the geographical coordinates express in defined units.",
            params: {
                required: true
            }
        },
        {
            key: "radiusUnit",
            label: "Radius Unit",
            type: "select",
            defaultValue: "KM",
            description: "Unit of measurement used to express the radius. It can be either metric kilometer or imperial mile.",
            params: {
                required: true,
                options: [
                    {
                        label: "Kilometers",
                        value: "KM"
                    },
                    {
                        label: "Miles",
                        value: "MILE"
                    }
                ]
            }
        },
        {
            key: "latitude",
            label: "Latitude",
            type: "cognigyText",
            description: "The latitude of the searched geographical point expressed in geometric degrees.",
            params: {
                required: true
            },
            condition: {
                key: "searchOption",
                value: "geocode"
            }
        },
        {
            key: "longitude",
            label: "Longitude",
            type: "cognigyText",
            description: "The longitude of the searched geographical point expressed in geometric degrees.",
            params: {
                required: true
            },
            condition: {
                key: "searchOption",
                value: "geocode"
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
            defaultValue: "amadeus.hotels",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "amadeus.hotels",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: [
                "radiusUnit",
                "radius"
            ]
        },
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
        { type: "field", key: "oauth2Connection" },
        { type: "field", key: "searchOption" },
        { type: "field", key: "cityCode" },
        { type: "field", key: "latitude" },
        { type: "field", key: "longitude" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storageOption" }
    ],
    appearance: {
        color: "#000835"
    },
    dependencies: {
        children: [
            "onFoundHotels",
            "onNotFoundHotels"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ISearchHotelsParams) => {
        const { api } = cognigy;
        const { oauth2Connection, searchOption, cityCode, latitude, longitude, radius, radiusUnit, storeLocation, inputKey, contextKey } = config;
        const { apiUrl, clientId, clientSecret } = oauth2Connection;

        try {

            let data = qs.stringify({
                "client_id": clientId,
                "client_secret": clientSecret,
                "grant_type": "client_credentials"
            });

            const authenticationResponse: AxiosResponse = await axios({
                method: "post",
                url: `${apiUrl}/v1/security/oauth2/token`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data
            });

            let hotelsSearchResponse: AxiosResponse;

            switch(searchOption) {
                case "city":
                    hotelsSearchResponse = await axios({
                        method: "get",
                        url: `${apiUrl}/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode.toUpperCase()}&radius=${radius}&radiusUnit=${radiusUnit}`,
                        headers: {
                            "Authorization": `Bearer ${authenticationResponse.data.access_token}`
                        }
                    });
                    break;
                case "geocode":
                    hotelsSearchResponse = await axios({
                        method: "get",
                        url: `${apiUrl}/v1/reference-data/locations/hotels/by-geocode?latitude=${latitude}&longitude=${longitude}&radius=${radius}&radiusUnit=${radiusUnit}`,
                        headers: {
                            "Authorization": `Bearer ${authenticationResponse.data.access_token}`
                        }
                    });
                    break;
            }

            if (hotelsSearchResponse.data?.data?.length !== 0) {
                const onSuccessChild = childConfigs.find(child => child.type === "onFoundHotels");
                api.setNextNode(onSuccessChild.id);


            if (storeLocation === 'context') {
                api.addToContext(contextKey, hotelsSearchResponse.data.data, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, flightOffersSearchResponse.data.data);
            }
            } else {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundHotels");
                api.setNextNode(onErrorChild.id);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundHotels");
            api.setNextNode(onErrorChild.id);

            if (storeLocation === 'context') {
                api.addToContext(contextKey, { error: error.message }, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error.message });
            }
        }
    }
});


export const onFoundHotels = createNodeDescriptor({
    type: "onFoundHotels",
    parentType: "searchHotels",
    defaultLabel: {
        default: "On Found"
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

export const onNotFoundHotels = createNodeDescriptor({
    type: "onNotFoundHotels",
    parentType: "searchHotels",
    defaultLabel: {
        default: "On Not Found"
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

