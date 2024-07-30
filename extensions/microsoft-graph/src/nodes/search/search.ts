import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { Client } from "@microsoft/microsoft-graph-client";
import axios from 'axios';

const qs = require("qs");


export interface ISearchParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            clientId: string;
            clientSecret: string;
            tenantId: string;
        };
        queryString: string;
        entityTypes: string[];
        region: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const searchNode = createNodeDescriptor({
    type: "search",
    defaultLabel: "Search",
    preview: {
        key: "queryString",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "Search Connection",
            type: "connection",
            params: {
                connectionType: "search",
                required: true
            }
        },
        {
            key: "queryString",
            label: "Query",
            type: "cognigyText",
            defaultValue: "{{input.text}}",
            params: {
                required: true
            }
        },
        {
            key: "entityTypes",
            label: "Entity Types",
            type: "textArray",
            description: "The Microsoft entity types that should be searched through",
            defaultValue: ["site", "listItem"],
        },
        {
            key: "region",
            label: "Region",
            type: "cognigyText",
            description: "The region of the search, such as US or DEU",
            defaultValue: "DEU"
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            defaultValue: "input",
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
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "microsoft.search",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "microsoft.search",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
        {
            key: "storage",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        },
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: [
                "entityTypes",
                "region"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "queryString" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#00a1f1"
    },
    dependencies: {
        children: [
            "onFound",
            "onNotFound"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ISearchParams) => {
        const { api } = cognigy;
        const { connection, queryString, entityTypes, region, storeLocation, contextKey, inputKey } = config;
        const { clientId, clientSecret, tenantId } = connection;

        try {
            // Initialize the client credentials

            const data = qs.stringify({
                'grant_type': 'client_credentials',
                'client_id': clientId,
                'client_secret': clientSecret,
                'scope': 'https://graph.microsoft.com/.default'
            });

            const tokenResponse = await axios({
                method: 'post',
                url: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data
            });

            const accessToken = tokenResponse?.data?.access_token;

            // Initialize the Microsoft Graph client
            const client = Client.init({
                authProvider: async (done) => {
                    try {
                        done(null, accessToken);
                    } catch (error) {
                        done(error, null);
                    }
                }
            });

            const searchRequest = {
                requests: [
                    {
                        entityTypes: entityTypes || ["site", "listItem"],
                        query: {
                            queryString
                        },
                        region: region || "DEU"
                    }
                ]
            };

            const response = await client.api("/search/query")
                .post(searchRequest);


            if (response?.value[0]?.hitsContainers[0]?.hits[0]?.summary) {
                const onSuccessChild = childConfigs.find(child => child.type === "onFound");
                api.setNextNode(onSuccessChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response?.value, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response?.value);
                }
            } else {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFound");
                api.setNextNode(onErrorChild.id);
            }
        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onNotFound");
            api.setNextNode(onErrorChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, error.message, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error.message);
            }
        }
    }
});

export const onFound = createNodeDescriptor({
    type: "onFound",
    parentType: "search",
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

export const onNotFound = createNodeDescriptor({
    type: "onNotFound",
    parentType: "search",
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

