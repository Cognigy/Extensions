import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import request from 'request-promise';

/**
 * This file contains a simple node with many field types, sections, etc
 *
 * It demonstrates how you can write a new flow-node in Cognigy.AI 4.0.0
 * and shows important concepts
 */
export interface IShowGoogleMaps extends INodeFunctionBaseParams {
    config: {
        connection: {
            key: string;
        };
        zoom: any;
        longitude: any;
        latitude: any;
        searchchoice: string;
        searchquery: any;
    };
}
export const showGoogleMaps = createNodeDescriptor({
    type: "show google maps",
    defaultLabel: "Show Google Maps",
    preview: {
        key: "searchquery",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "The api-key which should be used.",
            type: "connection",
            params: {
                connectionType: "api-key",
                required: true
            }
        },
        {
            key: "searchchoice",
            type: "select",
            label: "location type",
            defaultValue: "address",
            params: {
                options: [
                    {
                        label: "Address",
                        value: "address",
                    },
                    {
                        label: "Coordinates",
                        value: "coordinates",
                    },
                ],
            },
        },
        {
            key: "searchquery",
            label: "Centers the map on the address",
            type: "cognigyText",
            defaultValue: "Speditionsstraße 1",
            condition: {
                key: "searchchoice",
                value: "address"
            },
            params: {
                disabled: false,
                placeholder: "",
                required: true
            }
        },
        {
            key: "latitude",
            label: "If no address: the latitute of the start position (e.g. 51.2139586)",
            type: "cognigyText",
            defaultValue: "",
            condition: {
                key: "searchchoice",
                value: "coordinates"
            },
            params: {
                disabled: false,
                placeholder: "",
                required: false
            }
        },
        {
            key: "longitude",
            label: "If no address: the longitude of the start position (e.g. 6.7489951)",
            type: "cognigyText",
            condition: {
                key: "searchchoice",
                value: "coordinates"
            },
            params: {
                disabled: false,
                placeholder: "",
                required: false
            }
        },
        {
            key: "zoom",
            label: "The zoom factor of the map (e.g. 20)",
            type: "cognigyText",
            params: {
                disabled: false,
                placeholder: "",
                required: false
            }
        },
    ],
    sections: [
        {
            key: "zoomSection",
            label: "Zoom",
            defaultCollapsed: true,
            fields: [
                "zoom",
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
        { type: "field", key: "searchchoice" },
        { type: "field", key: "searchquery" },
        { type: "field", key: "latitude" },
        { type: "field", key: "longitude" },
        { type: "section", key: "zoomSection" },
        { type: "section", key: "connectionSection" },
    ],
    appearance: {
        color: "#1e9c6d"
    },
    function: async ({ cognigy, config }: IShowGoogleMaps) => {
        const { api } = cognigy;
        const { connection, searchquery, latitude, longitude, zoom } = config;

        let request_success: boolean = false;

        let longnew: number = longitude;
        let latnew: number = latitude;
        let zoomnew: number = zoom;

        if (isNaN(latitude) || !latitude) {
            latnew = (51.2141562) as number;
        }
        if (isNaN(longitude) || !longitude) {
            longnew = (6.7488952) as number;
        }
        if (isNaN(zoom) || !zoom) {
            zoomnew = 10 as number;
        }
        if (searchquery >= "" || searchquery != null || searchquery !== "") {
            try {
                const place = await request({
                    uri: 'https://maps.googleapis.com/maps/api/geocode/json',
                    qs: {
                        key: connection.key,
                        address: searchquery
                    },
                    json: true
                });

                api.addToContext("maps response", place.results[0], 'simple');

                try {
                    const { lng, lat } = place.results[0].geometry.location;
                    request_success;
                    longnew = lng;
                    latnew = lat;
                } catch (error) {
                    api.say(JSON.stringify(place.data));
                    api.say("location not found");
                    // location not found
                }
            } catch (error) {
                api.say("Axios-" + error + error.message);
                api.say(`https://maps.googleapis.com/maps/api/geocode/json?key=${connection.key}&address=${searchquery.replace(/ /g, "%20")}`);
            }

        } else {
            api.say("unable to process data");
        }

        if (request_success || (longitude != null && latitude != null)) {
            api.output('', {
                "_plugin": {
                    "type": 'google-maps',
                    "center": {
                        "lat": latnew,
                        "lng": longnew
                    },
                    "zoom": Number(zoomnew),
                    "bootstrapURLKeys": connection.key
                }
            });
        } else {
            api.say("location cant be found");
        }
    }
});