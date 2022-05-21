import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetWorkersParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            tenantHostname: string
        };
        search: string;
        limit: number;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const getWorkersNode = createNodeDescriptor({
    type: "getWorkers",
    defaultLabel: {
        default: "Get Workers",
        deDE: "Erhalte Arbeiter:innen"
    },
    summary: {
        default: "Retrieves a collection of workers",
        deDE: "Gibt eine Liste an Arbeiter:innen wieder",
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Workday Authentication"
            },
            type: "connection",
            params: {
                connectionType: "workday",
                required: true
            }
        },
        {
            key: "search",
            label: {
                default: "Search",
                deDE: "Suche"
            },
            description: {
                default: "Searches workers by name. The search is case-insensitive. You can include space-delimited search strings for an OR search",
                deDE: "Sucht Arbeiter:innen nach Namen. Großschreibung ist egal.",
            },
            type: "cognigyText",
            defaultValue: ""
        },
        {
            key: "limit",
            label: {
                default: "Limit"
            },
            description: {
                default: "Limits the result",
                deDE: "Limitiert das Ergebnis",
            },
            type: "number",
            defaultValue: 15
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
            defaultValue: "workday.workers",
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
            defaultValue: "sap.contacts",
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
        },
        {
            key: "advanced",
            label: {
                default: "Advanced",
                deDE: "Advanced"
            },
            defaultCollapsed: true,
            fields: [
                "search",
                "filter"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "filter" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#3282E0"
    },
    function: async ({ cognigy, config }: IGetWorkersParams) => {
        const { api } = cognigy;
        const { connection, search, limit, storeLocation, contextKey, inputKey } = config;
        const { tenantHostname } = connection;

        try {

            const response = await axios({
                method: "GET",
                url: `https://${tenantHostname}/api/common/v1/workers?limit=${limit}&search=${encodeURIComponent(search)}`,
                headers: {
                    "Accept": "application/json"
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }

        } catch (error) {
            api.log("error", error.message);
        }
    }
});