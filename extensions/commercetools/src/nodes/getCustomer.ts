import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";
const qs = require("qs");

export interface IGetCustomerParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            projectKey: string;
            clientId: string;
            secret: string;
            scope: string;
            apiUrl: string;
            authUrl: string;
        };
        filter: string;
        firstName: string;
        lastName: string;
        email: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const getCustomerNode = createNodeDescriptor({
    type: "getCustomer",
    defaultLabel: {
        default: "Get Customer",
        deDE: "Kunde suchen"
    },
    summary: {
        default: "Receives the customer data based on filters",
        deDE: "Sucht mit Filtern nach dem Kunden",
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
            key: "filter",
            label: "Filter",
            type: "select",
            defaultValue: "name",
            params: {
                required: true,
                options: [
                    {
                        label: "Name",
                        value: "name"
                    },
                    {
                        label: "E-Mail",
                        value: "email"
                    }
                ]
            }
        },
        {
            key: "firstName",
            label: {
                default: "First Name",
                deDE: "Vorname"
            },
            type: "cognigyText",
            params: {
                required: true,
            },
            condition: {
                key: "filter",
                value: "name"
            }
        },
        {
            key: "lastName",
            label: {
                default: "Last Name",
                deDE: "Nachname"
            },
            type: "cognigyText",
            params: {
                required: true,
            },
            condition: {
                key: "filter",
                value: "name"
            }
        },
        {
            key: "email",
            label: {
                default: "E-Mail Address",
                deDE: "E-Mail Adresse"
            },
            type: "cognigyText",
            params: {
                required: true,
            },
            condition: {
                key: "filter",
                value: "email"
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
        { type: "field", key: "filter" },
        { type: "field", key: "firstName" },
        { type: "field", key: "lastName" },
        { type: "field", key: "email" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#ffd00a"
    },
    dependencies: {
        children: [
            "onFoundCustomer",
            "onNotFoundCustomer"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetCustomerParams) => {
        const { api } = cognigy;
        const { connection, filter, firstName, lastName, email, storeLocation, contextKey, inputKey } = config;
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

            api.say(JSON.stringify(authResponse.data));

            let filterQueryString = "";
            if (filter === "name") {
                filterQueryString = `where=firstName%20%3D%20%3AfirstName&var.firstName=${firstName}&where=lastName%20%3D%20%3AlastName&var.lastName=${lastName}`;
            } else if (filter === "email") {
                filterQueryString = `where=email%20%3D%20%3Aemail&var.email=${email}`;
            }

            const response = await axios({
                method: "GET",
                url: `${apiUrl}/${projectKey}/customers?${filterQueryString}`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authResponse.data.access_token}`
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }

            if (response.data?.results?.length !== 0) {
                const onSuccessChild = childConfigs.find(child => child.type === "onFoundCustomer");
                api.setNextNode(onSuccessChild.id);
            } else {
                const onErrorChild = childConfigs.find(child => child.type === "onErrorShorten");
                api.setNextNode(onErrorChild.id);
            }
        } catch (error) {
            const onErrorChild = childConfigs.find(child => child.type === "onErrorShorten");
            api.setNextNode(onErrorChild.id);
            api.log("error", error.message);
        }
    }
});


export const onFoundCustomer = createNodeDescriptor({
    type: "onFoundCustomer",
    parentType: "getCustomer",
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

export const onNotFoundCustomer = createNodeDescriptor({
    type: "onNotFoundCustomer",
    parentType: "getCustomer",
    defaultLabel: {
        default: "Not Found",
        deDE: "Nicht Gefunden"
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