import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ISearchArticlesParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            subdomain: string;
        };
        query: number;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const searchArticlesNode = createNodeDescriptor({
    type: "searchArticles",
    defaultLabel: "Search Articles",
    summary: "Searches for Help Center articles based on a search query",
    fields: [
        {
            key: "connection",
            label: "Zendesk Connection",
            type: "connection",
            params: {
                connectionType: "zendesk",
                required: true
            }
        },
        {
            key: "query",
            label: "Search Query",
            type: "cognigyText",
            description: "The search query that is used in order find help center articles",
            params: {
                required: true,
            },
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
            defaultValue: "zendesk.articles",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "zendesk.articles",
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
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "query" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#00363d"
    },
    dependencies: {
        children: [
            "onFoundArticles",
            "onNotFoundArticles"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ISearchArticlesParams) => {
        const { api } = cognigy;
        const { query, connection, storeLocation, contextKey, inputKey } = config;
        const { username, password, subdomain } = connection;

        try {

            const response = await axios({
                method: "get",
                url: `https://${subdomain}.zendesk.com/api/v2/help_center/articles/search?query=${query}`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                auth: {
                    username,
                    password
                }
            });

            if (response.data?.results?.length === 0) {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundArticles");
                api.setNextNode(onErrorChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response.data.results, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response.data.results);
                }
            } else {
                const onSuccessChild = childConfigs.find(child => child.type === "onFoundArticles");
                api.setNextNode(onSuccessChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response.data?.results, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response.data?.results);
                }
            }
        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundArticles");
            api.setNextNode(onErrorChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error.message }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error.message });
            }
        }
    }
});

export const onFoundArticles = createNodeDescriptor({
    type: "onFoundArticles",
    parentType: "searchArticles",
    defaultLabel: "On Found",
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

export const onNotFoundArticles = createNodeDescriptor({
    type: "onNotFoundArticles",
    parentType: "searchArticles",
    defaultLabel: "On Not Found",
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

