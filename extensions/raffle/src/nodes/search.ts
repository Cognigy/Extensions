import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ISearchParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
            organizationId: string;
        };
        uid: string;
        query: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}


export const searchNode = createNodeDescriptor({
    type: "search",
    defaultLabel: {
        default: "Search",
        deDE: "Suchen"
    },
    summary: {
        default: "Searches for articles based on a query",
        deDE: "Sucht nach passenden Artikeln zu einer Nutzeranfrage",
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Raffle Authentication"
            },
            type: "connection",
            params: {
                connectionType: "raffle",
                required: true
            }
        },
        {
            key: "uid",
            label: {
                default: "Search Instance UID",
                deDE: "UID der Suchinstanz"
            },
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "query",
            label: {
                default: "Query",
                deDE: "Suchanfrage"
            },
            type: "cognigyText",
            params: {
                required: true
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
            defaultValue: "raffle",
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
            defaultValue: "raffle",
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
        { type: "field", key: "uid" },
        { type: "field", key: "query" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "black"
    },
    dependencies: {
        children: [
            "onSuccessSearch",
            "onErrorSearch"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ISearchParams) => {
        const { api, input } = cognigy;
        const { connection, query, uid, storeLocation, contextKey, inputKey } = config;
        const { accessToken } = connection;

        try {

            const response = await axios({
                method: "GET",
                url: `https://api.raffle.ai/v1/search?uid=${uid}&session-id=${input.sessionId}&query=${encodeURIComponent(query)}`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }

            if (response.data?.results?.length !== 0) {
                const onSuccessChild = childConfigs.find(child => child.type === "onSuccessSearch");
                api.setNextNode(onSuccessChild.id);
            } else {
                const onErrorChild = childConfigs.find(child => child.type === "onErrorSearch");
                api.setNextNode(onErrorChild.id);
            }

        } catch (error) {
            const onErrorChild = childConfigs.find(child => child.type === "onErrorSearch");
            api.setNextNode(onErrorChild.id);
            api.log("error", error.message);
        }
    }
});


export const onSuccessSearch = createNodeDescriptor({
    type: "onSuccessSearch",
    parentType: "search",
    defaultLabel: {
        default: "Found",
        deDE: "Gefunden",
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

export const onErrorSearch = createNodeDescriptor({
    type: "onErrorSearch",
    parentType: "search",
    defaultLabel: {
        default: "Not Found",
        deDE: "Nicht gefunden"
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
        color: "red",
        textColor: "white",
        variant: "mini"
    }
});