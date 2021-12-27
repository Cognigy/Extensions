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
    defaultLabel: {
        default: "Search Articles",
        deDE: "Suche Artikel",
        esES: "Buscar Articulos"
    },
    summary: {
        default: "Searches for Help Center articles based on a search query",
        deDE: "Durchsucht das Help Center nach passenden Artikeln zu einer Suchanfrage",
        esES: "Busca artículos del Centro de ayuda según una consulta de búsqueda"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Zendesk Connection",
                deDE: "Zendesk Verbindung",
                esES: "Zendesk Conexión"
            },
            type: "connection",
            params: {
                connectionType: "zendesk",
                required: true
            }
        },
        {
            key: "query",
            label: {
                default: "Search Query",
                deDE: "Suchanfrage",
                esES: "Consulta de busqueda"
            },
            type: "cognigyText",
            description: {
                default: "The search query that is used in order find help center articles",
                deDE: "Die Suchanfrage welche verwendet werden soll",
                esES: "La consulta de búsqueda que se utiliza para buscar artículos del centro de ayuda."
            },
            params: {
                required: true,
            },
        },
        {
            key: "storeLocation",
            type: "select",
            label: {
                default: "Where to store the result",
                deDE: "Wo das Ergebnis gespeichert werden soll",
                esES: "Dónde almacenar el resultado"
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
                deDE: "Input Schlüssel",
                esES: "Input Key para almacenar el resultado"
            },
            defaultValue: "zendesk.articles",
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
                deDE: "Context Schlüssel",
                esES: "Context Key para almacenar el resultado"
            },
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
            label: {
                default: "Storage Option",
                deDE: "Speicheroption",
                esES: "Opción de almacenamiento"
            },
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
    defaultLabel: {
		default: "On Found",
		deDE: "Artikel gefunden",
		esES: "Encontre"
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

export const onNotFoundArticles = createNodeDescriptor({
    type: "onNotFoundArticles",
    parentType: "searchArticles",
    defaultLabel: {
		default: "On Not Found",
		deDE: "Keine Artikel gefunden",
		esES: "Nada Encontrado"
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

