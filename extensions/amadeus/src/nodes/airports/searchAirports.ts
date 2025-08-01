import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';

export interface IFlightOffersSearch extends INodeFunctionBaseParams {
    config: {
        oauth2Connection: {
            apiUrl: string;
            clientId: string;
            clientSecret: string;
        };
        keyword: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const searchAirportsNode = createNodeDescriptor({
    type: "searchAirports",
    defaultLabel: "Search Airports",
    summary: "Searches for airports by keyword",
    preview: {
        key: "keyword",
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
            key: "keyword",
            label: "Keyword",
            type: "cognigyText",
            description: "The keyword to use for the airport search",
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
            defaultValue: "amadeus.airports",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "amadeus.airports",
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
        { type: "field", key: "keyword" },
        { type: "section", key: "storageOption" }
    ],
    appearance: {
        color: "#000835"
    },
    dependencies: {
        children: [
            "onFoundAirports",
            "onNotFoundAirports"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IFlightOffersSearch) => {
        const { api } = cognigy;
        const { oauth2Connection, keyword, storeLocation, inputKey, contextKey } = config;
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

            const airportsSearchResponse: AxiosResponse = await axios({
                        method: "get",
                        url: `${apiUrl}/v1/reference-data/locations?subType=AIRPORT&keyword=${decodeURIComponent(keyword)}`,
                        headers: {
                            "Authorization": `Bearer ${authenticationResponse.data.access_token}`
                        }
                    });

            if (airportsSearchResponse.data?.data?.length !== 0) {
                const onSuccessChild = childConfigs.find(child => child.type === "onFoundAirports");
                api.setNextNode(onSuccessChild.id);


            if (storeLocation === 'context') {
                api.addToContext(contextKey, airportsSearchResponse.data.data, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, airportsSearchResponse.data.data);
            }
            } else {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundAirports");
                api.setNextNode(onErrorChild.id);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundAirports");
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


export const onFoundAirports = createNodeDescriptor({
    type: "onFoundAirports",
    parentType: "searchAirports",
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

export const onNotFoundAirports = createNodeDescriptor({
    type: "onNotFoundAirports",
    parentType: "searchAirports",
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

