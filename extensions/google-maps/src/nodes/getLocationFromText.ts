import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import request from 'request-promise';

export interface IGetLocationFromText extends INodeFunctionBaseParams {
    config: {
        connection: {
            key: string;
        };
        place: string;
        city: string;
        country: string;
        storeType: string;
        contextStore: string;
        inputStore: string;
    };
}
export const getLocationFromText = createNodeDescriptor({
    type: "getLocationFromText",
    defaultLabel: "Location search",
    preview: {
        key: "place",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "API Key",
            type: "connection",
            params: {
                connectionType: "api-key",
                required: true
            }
        },
        {
            key: "place",
            label: "Place",
            type: "cognigyText",
            defaultValue: "",
            params: {
                required: true
            },
        },
        {
            key: "city",
            label: "City",
            type: "cognigyText",
            params: {
                required: true
            },
        },
        {
            key: "country",
            label: "Country",
            type: "cognigyText",
            params: {
                required: true
            },
        },
        {
            key: "contextStore",
            label: "Context Key",
            type: "cognigyText",
            defaultValue: "address",
            params: {
                required: true
            },
        },
    ],
    sections: [
        {
            key: "contextSection",
            label: "Storage Options",
            defaultCollapsed: true,
            fields: [
                "contextStore",
            ]
        },
        {
            key: "connectionSection",
            label: "Authentication",
            defaultCollapsed: false,
            fields: [
                "connection",
            ]
        }
    ],
    form: [
        { type: "field", key: "place" },
        { type: "field", key: "city" },
        { type: "field", key: "country" },
        { type: "section", key: "contextSection" },
        { type: "section", key: "connectionSection" },
    ],
    appearance: {
        color: "#1e9c6d"
    },

    function: async ({ cognigy, config }: IGetLocationFromText) => {
        const { api, input } = cognigy;
        const { connection, place, city, country, contextStore, inputStore, storeType } = config;

        let userAddress: string;
        let latitude: any;
        let longitude: any;

        if (!contextStore || !place || !city || !country || !connection) {
        } else {
            try {
                let address = `${place}, ${city}, ${country}`.replace(/ /g, "%20");

                const googleResponse = await request({
                    uri: 'https://maps.googleapis.com/maps/api/geocode/json',
                    qs: {
                        key: connection.key,
                        address: address
                    },
                    json: true
                });

                try {
                    userAddress = googleResponse.results[0].formatted_address;
                    latitude = googleResponse.results[0].geometry.location.lat;
                    longitude = googleResponse.results[0].geometry.location.lng;
                } catch (error) {
                }
                api.addToContext(contextStore, {
                    "coordinates": {
                        "longitude": longitude,
                        "latitude": latitude
                    },
                    "address": userAddress,
                    "name": place
                }, 'simple');

            } catch (error) {
            }
        }
    }
});