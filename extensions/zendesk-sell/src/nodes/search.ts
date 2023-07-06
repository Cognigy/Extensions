import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export interface ISearchContactsParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
        };
        useEmail: boolean;
        useDisplayName: boolean;
        useMobile: boolean;
        email: string;
        displayName: string;
        mobile: string;
        filterOperator: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const searchContactsNode = createNodeDescriptor({
    type: "searchContacts",
    defaultLabel: {
        default: "Search Contacts",
        deDE: "Suche Kontakte"
    },
    summary: {
        default: "Searches for CRM conptacts",
        deDE: "Durchsucht das CRM nach passenden Kontakten",
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Zendesk Sell Connection",
                deDE: "Zendesk Sell Verbindung"
            },
            type: "connection",
            params: {
                connectionType: "zendesk-sell-access-token",
                required: true
            }
        },
        {
            key: "filterOperator",
            type: "select",
            label: {
                default: "Filter Operator",
                deDE: "Filteroperator",
            },
            defaultValue: "or",
            params: {
                options: [
                    {
                        label: {
                            default: "Or",
                            deDE: "Oder",
                        },
                        value: "or"
                    },
                    {
                        label: {
                            default: "And",
                            deDE: "Und",
                        },
                        value: "and"
                    },
                ],
                required: false
            },
        },
        {
            key: "useEmail",
            type: "toggle",
            label: {
                default: "Use Email Address",
                deDE: "E-Mail Adresse verwenden",
            },
            description: {
                default: "Should the email address be used for the search query?",
                deDE: "Soll die E-Mail Adresse für die Suchanfrage verwendet werden?",
            },
            defaultValue: true
        },
        {
            key: "email",
            label: {
                default: "Email Address",
                deDE: "E-Mail Adresse"
            },
            type: "cognigyText",
            params: {
                required: false,
            },
            condition: {
                key: "useEmail",
                value: true
            }
        },
        {
            key: "useDisplayName",
            type: "toggle",
            label: {
                default: "Use Full Name",
                deDE: "Namen verwenden",
            },
            description: {
                default: "Should the full name be used for the search query?",
                deDE: "Soll der Name für die Suchanfrage verwendet werden?",
            },
            defaultValue: true
        },
        {
            key: "displayName",
            label: {
                default: "Full Name",
                deDE: "Name"
            },
            type: "cognigyText",
            params: {
                required: false,
            },
            condition: {
                key: "useDisplayName",
                value: true
            }
        },
        {
            key: "useMobile",
            type: "toggle",
            label: {
                default: "Use Mobile Number",
                deDE: "Handynummer verwenden",
            },
            description: {
                default: "Should the mobile number be used for the search query?",
                deDE: "Soll die Handynummer für die Suchanfrage verwendet werden?",
            },
            defaultValue: true
        },
        {
            key: "mobile",
            label: {
                default: "Full Name",
                deDE: "Name"
            },
            type: "cognigyText",
            params: {
                required: false,
            },
            condition: {
                key: "useMobile",
                value: true
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
                deDE: "Input Key zum Speichern des Ergebnisses",
            },
            defaultValue: "zendesk.contacts",
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
                deDE: "Context Key zum Speichern des Ergebnisses",
            },
            defaultValue: "zendesk.contacts",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
        {
            key: "advanced",
            label: {
                default: "Advanced",
                deDE: "Erweitert",
            },
            defaultCollapsed: true,
            fields: [
                "filterOperator"
            ]
        },
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
        { type: "field", key: "useMobile" },
        { type: "field", key: "mobile" },
        { type: "field", key: "useEmail" },
        { type: "field", key: "email" },
        { type: "field", key: "useDisplayName" },
        { type: "field", key: "displayName" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#D4AE5E"
    },
    dependencies: {
        children: [
            "onFoundContacts",
            "onNotFoundContacts"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ISearchContactsParams) => {
        const { api } = cognigy;
        const { filterOperator, useMobile, useEmail, useDisplayName, mobile, email, displayName, connection, storeLocation, contextKey, inputKey } = config;
        const { accessToken } = connection;

        let filters: any[] = [];

        if (useMobile) {
            filters.push({
                "filter": {
                    "attribute": {
                        "name": "mobile"
                    },
                    "parameter": {
                        "starts_with": mobile
                    }
                }
            });
        }

        if (useEmail) {
            filters.push({
                "filter": {
                    "attribute": {
                        "name": "email"
                    },
                    "parameter": {
                        "starts_with": email
                    }
                }
            });
        }

        if (useDisplayName) {
            filters.push({
                "filter": {
                    "attribute": {
                        "name": "display_name"
                    },
                    "parameter": {
                        "starts_with": displayName
                    }
                }
            });
        }

        try {

            let queryData = {
                "items": [{
                    "data": {
                        "query": {
                            "filter": {}
                        }
                    }
                }]
            };

            // Add the dynamic filters for the query data
            queryData["item"]["data"]["query"]["filter"]["or"] = filters;

            const response = await axios({
                method: "post",
                url: `https://api.getbase.com/v3/contacts/search`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                data: queryData
            });

            if (response.data?.items?.length === 0) {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundContacts");
                api.setNextNode(onErrorChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response.data.items, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response.data.items);
                }
            } else {
                const onSuccessChild = childConfigs.find(child => child.type === "onFoundContacts");
                api.setNextNode(onSuccessChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response.data?.items, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response.data?.items);
                }
            }
        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundContacts");
            api.setNextNode(onErrorChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error });
            }
        }
    }
});

export const onFoundContacts = createNodeDescriptor({
    type: "onFoundContacts",
    parentType: "searchContacts",
    defaultLabel: {
        default: "On Found",
        deDE: "Kontakt gefunden"
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

export const onNotFoundContacts = createNodeDescriptor({
    type: "onNotFoundContacts",
    parentType: "searchContacts",
    defaultLabel: {
        default: "On Not Found",
        deDE: "Niemanden gefunden"
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

