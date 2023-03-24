import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";
const qs = require("qs");

export interface ISuggestProductsParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            projectKey: string;
            clientId: string;
            secret: string;
            scope: string;
            apiUrl: string;
            authUrl: string;
        };
        text: string;
        limit: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const suggestProductsNode = createNodeDescriptor({
    type: "suggestProducts",
    defaultLabel: {
        default: "Suggest Products",
        deDE: "Produkte vorschlagen"
    },
    summary: {
        default: "Suggests products",
        deDE: "Schlägt Produkte vor",
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "commercetools Authentication"
            },
            type: "connection",
            params: {
                connectionType: "commercetools",
                required: true
            }
        },
        {
            key: "text",
            label: "Text",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "limit",
            label: "Limit",
            type: "cognigyText",
            defaultValue: "10",
            params: {
                required: true,
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: {
                default: "Where to store the result",
                deDE: "Wo das Ergebnis gespeichert werden soll"
            },
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
            label: {
                default: "Input Key to store Result",
                deDE: "Input Key zum Speichern des Ergebnisses"
            },
            defaultValue: "commercetools",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: {
                default: "Context Key to store Result",
                deDE: "Context Key zum Speichern des Ergebnisses"
            },
            defaultValue: "commercetools",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        }
    ],
    sections: [
        {
            key: "storage",
            label: {
                default: "Storage Option",
                deDE: "Speicheroption"
            },
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "text" },
        { type: "field", key: "limit" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#ffd00a"
    },
    dependencies: {
        children: [
            "onSuggestions",
            "onNoSuggestions"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ISuggestProductsParams) => {
        const { api } = cognigy;
        const { connection, text, limit, storeLocation, contextKey, inputKey } = config;
        const { projectKey, clientId, secret, scope, authUrl, apiUrl } = connection;

        try {

            const data = qs.stringify({
                "grant_type": "client_credentials",
                scope
            });

            const authResponse = await axios({
                method: "POST",
                url: `${authUrl}/oauth/token`,
                auth: {
                    username: clientId,
                    password: secret
                },
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data
            });

            const suggestionResponse = await axios({
                method: "GET",
                url: `${apiUrl}/${projectKey}/product-projections/suggest?searchKeywords.en-US=${text}&fuzzy=true`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authResponse.data.access_token}`
                }
            });

            if (suggestionResponse.data["searchKeywords.en-US"][0]?.text.length !== 0) {

                const response = await axios({
                    method: "GET",
                    url: `${apiUrl}/${projectKey}/product-projections/search?limit=${limit}&text.en-US="${suggestionResponse.data["searchKeywords.en-US"][0].text}"`,
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authResponse.data.access_token}`
                    }
                });

                const onSuccessChild = childConfigs.find(child => child.type === "onSuggestions");
                api.setNextNode(onSuccessChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response.data.results, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response.data.results);
                }

            } else {
                const onErrorChild = childConfigs.find(child => child.type === "onNoSuggestions");
                api.setNextNode(onErrorChild.id);
            }
        } catch (error) {
            const onErrorChild = childConfigs.find(child => child.type === "onNoSuggestions");
            api.setNextNode(onErrorChild.id);
            api.log("error", error.message);
        }
    }
});


export const onSuggestions = createNodeDescriptor({
    type: "onSuggestions",
    parentType: "suggestProducts",
    defaultLabel: {
        default: "On Idea",
        deDE: "Idee gefunden",
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

export const onNoSuggestions = createNodeDescriptor({
    type: "onNoSuggestions",
    parentType: "suggestProducts",
    defaultLabel: {
        default: "No Suggestions",
        deDE: "Keine Vorschläge"
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