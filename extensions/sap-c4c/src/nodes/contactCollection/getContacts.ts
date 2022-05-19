import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetContactsParamss extends INodeFunctionBaseParams {
    config: {
        connection: {
            domain: string;
            apikey: string;
        };
        filter: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const getContactsNode = createNodeDescriptor({
    type: "getContacts",
    defaultLabel: {
        default: "Get Contacts",
        deDE: "Erhalte Kontakte"
    },
    summary: {
        default: "Retrieves contacts from the contact collection in SAP",
        deDE: "Gibt Kontakte aus SAP zurück",
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "SAP C4C API Key"
            },
            type: "connection",
            params: {
                connectionType: "sap-c4c-apikey",
                required: true
            }
        },
        {
            key: "filter",
            label: {
                default: "Filter"
            },
            description: {
                default: "The filter that should be used to search the contacts",
                deDE: "Der Filter, welcher zum Suchen verwendet werden soll",
            },
            type: "cognigyText",
            defaultValue: "Email eq 'doug.gamoff@3M.com'",
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
            defaultValue: "sap.contacts",
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
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "filter" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#00B9F2"
    },
    dependencies: {
        children: [
            "onFoundContact",
            "onNotFoundContact"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetContactsParamss) => {
        const { api } = cognigy;
        const { connection, filter, storeLocation, contextKey, inputKey } = config;
        const { apikey, domain } = connection;

        try {

            const response = await axios({
                method: "GET",
                url: `https://${domain}/sap/c4c/odata/v1/c4codataapi/ContactCollection?$filter=${filter}`,
                headers: {
                    "Accept": "application/json",
                    "APIKey": apikey
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data["d"]?.results, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data["d"]?.results);
            }

            if (response.data["d"]?.results?.length !== 0) {
                const onFoundChild = childConfigs.find(child => child.type === "onFoundContact");
                api.setNextNode(onFoundChild.id);
            } else {
                const onNotFoundChild = childConfigs.find(child => child.type === "onNotFoundContact");
                api.setNextNode(onNotFoundChild.id);
            }

        } catch (error) {
            api.log("error", error.message);
            const onNotFoundChild = childConfigs.find(child => child.type === "onNotFoundContact");
            api.setNextNode(onNotFoundChild.id);
        }
    }
});

export const onFoundContact = createNodeDescriptor({
    type: "onFoundContact",
    parentType: "getContacts",
    defaultLabel: {
        default: "On Found",
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

export const onNotFoundContact = createNodeDescriptor({
    type: "onNotFoundContact",
    parentType: "getContacts",
    defaultLabel: {
        default: "On Not Found",
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
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});