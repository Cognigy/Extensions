import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';

export interface IFlightOffersSearch extends INodeFunctionBaseParams {
    config: {
        oauth2Connection: {
            clientId: string;
            clientSecret: string;
        };
        originLocationCode: string;
        destinationLocationCode: string;
        departureDate: string;
        returnDate: string;
        adults: number;
        children: number;
        infants: number;
        travelClass: string;
        nonStop: boolean;
        maxPrice: string;
        currencyCode: string;
        max: number;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const flightOffersSearchNode = createNodeDescriptor({
    type: "flightOffersSearch",
    defaultLabel: "Search Flights",
    summary: "Searches for flight offers",
    preview: {
        key: "destinationLocationCode",
        type: "text"
    },
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
            key: "originLocationCode",
            label: "Origin Location Code",
            type: "cognigyText",
            description: "The airport code of the origin, such as DUS",
            params: {
                required: true
            }
        },
        {
            key: "destinationLocationCode",
            label: "Destination Location Code",
            type: "cognigyText",
            description: "The airport code of the destination, such as DUS",
            params: {
                required: true
            }
        },
        {
            key: "departureDate",
            label: "Departure Date",
            type: "cognigyText",
            description: "The date of the flight departure, such as 2024-01-01",
            params: {
                required: true
            }
        },
        {
            key: "returnDate",
            label: "Return Date",
            type: "cognigyText",
            description: "The date of the flight return, such as 2024-01-01",
            params: {
                required: true
            }
        },
        {
            key: "adults",
            label: "Adults",
            type: "cognigyText",
            description: "How many adults will take this flight, such as 1",
            params: {
                required: true
            }
        },
        {
            key: "children",
            label: "Children",
            type: "cognigyText",
            description: "How many children will take this flight, such as 1",
            params: {
                required: true
            }
        },
        {
            key: "infants",
            label: "Infants",
            type: "cognigyText",
            description: "How many infants will take this flight, such as 1",
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
            defaultValue: "amadeus.flights",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "amadeus.flights",
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
        { type: "field", key: "oauth2Connection" },
        { type: "field", key: "originLocationCode" },
        { type: "field", key: "destinationLocationCode" },
        { type: "field", key: "departureDate" },
        { type: "field", key: "returnDate" },
        { type: "field", key: "adults" },
        { type: "field", key: "children" },
        { type: "field", key: "infants" },
        { type: "section", key: "storageOption" }
    ],
    appearance: {
        color: "#000835"
    },
    dependencies: {
        children: [
            "onFoundFlightOffers",
            "onNotFoundFlightOffers"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IFlightOffersSearch) => {
        const { api } = cognigy;
        const { oauth2Connection, originLocationCode, destinationLocationCode, departureDate, returnDate, adults, children, infants, storeLocation, inputKey, contextKey } = config;
        const { clientId, clientSecret } = oauth2Connection;

        try {

            let data = qs.stringify({
                "client_id": clientId,
                "client_secret": clientSecret,
                "grant_type": "client_credentials"
            });

            const authenticationResponse: AxiosResponse = await axios({
                method: "post",
                url: "https://test.api.amadeus.com/v1/security/oauth2/token",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data
            });

            const flightOffersSearchResponse: AxiosResponse = await axios({
                method: "get",
                url: `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originLocationCode}&destinationLocationCode=${destinationLocationCode}&departureDate=${departureDate}&returnDate=${returnDate}&adults=${adults}&children=${children}&infants=${infants}&max=10`,
                headers: {
                    "Authorization": `Bearer ${authenticationResponse.data.access_token}`
                }
            });

            if (flightOffersSearchResponse.data?.data?.length !== 0) {
                const onSuccessChild = childConfigs.find(child => child.type === "onFoundFlightOffers");
                api.setNextNode(onSuccessChild.id);


            if (storeLocation === 'context') {
                api.addToContext(contextKey, flightOffersSearchResponse.data.data, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, flightOffersSearchResponse.data.data);
            }
            } else {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundFlightOffers");
                api.setNextNode(onErrorChild.id);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundFlightOffers");
            api.setNextNode(onErrorChild.id);

            if (storeLocation === 'context') {
                api.addToContext(contextKey, { error: error }, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error });
            }
        }
    }
});


export const onFoundFlightOffers = createNodeDescriptor({
    type: "onFoundFlightOffers",
    parentType: "flightOffersSearch",
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

export const onNotFoundFlightOffers = createNodeDescriptor({
    type: "onNotFoundFlightOffers",
    parentType: "flightOffersSearch",
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

