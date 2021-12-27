import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetCategoriesParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            subdomain: string;
        };
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const getCategoriesNode = createNodeDescriptor({
    type: "getCategories",
    defaultLabel: {
		default: "Get Categories",
		deDE: "Erhalte Kategorien",
		esES: "Obtener categorías"
	},
    summary: {
		default: "Retrieves all categories of the Help Center",
		deDE: "Erhalte alle Kategorien des Help Centers",
		esES: "Recupera todas las categorías del Centro de ayuda."
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
            defaultValue: "zendesk.categories",
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
            defaultValue: "zendesk.categories",
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
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#00363d"
    },
    function: async ({ cognigy, config }: IGetCategoriesParams) => {
        const { api } = cognigy;
        const { connection, storeLocation, contextKey, inputKey } = config;
        const { username, password, subdomain } = connection;

        try {

            const response = await axios({
                method: "get",
                url: `https://${subdomain}.zendesk.com/api/v2/help_center/categories`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                auth: {
                    username,
                    password
                }
            });


            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data?.categories, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data?.categories);
            }

        } catch (error) {

            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error.message }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error.message });
            }
        }
    }
});