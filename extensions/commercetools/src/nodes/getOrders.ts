import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";
const qs = require("qs");

export interface IGetOrdersParams extends INodeFunctionBaseParams {
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
        orderNumber: string;
        email: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const getOrdersNode = createNodeDescriptor({
    type: "getOrders",
    defaultLabel: {
        default: "Get Orders",
        deDE: "Bestellungen suchen"
    },
    summary: {
        default: "Receives the order data based on filters",
        deDE: "Sucht mit Filtern nach Bestellungen",
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
                        label: "Order Number",
                        value: "orderNumber"
                    },
                    {
                        label: "E-Mail",
                        value: "email"
                    }
                ]
            }
        },
        {
            key: "orderNumber",
            label: {
                default: "Order Number",
                deDE: "Bestellnummer"
            },
            type: "cognigyText",
            params: {
                required: true,
            },
            condition: {
                key: "filter",
                value: "orderNumber"
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
        { type: "field", key: "orderNumber" },
        { type: "field", key: "email" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#ffd00a"
    },
    dependencies: {
        children: [
            "onFoundOrders",
            "onNotFoundOrders"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetOrdersParams) => {
        const { api } = cognigy;
        const { connection, filter, orderNumber, email, storeLocation, contextKey, inputKey } = config;
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

            let filterQueryString = "";
            if (filter === "orderNumber") {
                filterQueryString = `where=orderNumber%20%3D%20%3AorderNumber&var.orderNumber=${orderNumber}`;
            } else if (filter === "email") {
                filterQueryString = `where=customerEmail%20%3D%20%3AcustomerEmail&var.customerEmail=${email}`;
            }

            const response = await axios({
                method: "GET",
                url: `${apiUrl}/${projectKey}/orders?${filterQueryString}`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authResponse.data.access_token}`
                }
            });

            if (response.data?.results?.length !== 0) {
                const onSuccessChild = childConfigs.find(child => child.type === "onFoundOrders");
                api.setNextNode(onSuccessChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response.data.results, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response.data.results);
                }
            } else {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundOrders");
                api.setNextNode(onErrorChild.id);
            }
        } catch (error) {
            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundOrders");
            api.setNextNode(onErrorChild.id);
            api.log("error", error.message);
        }
    }
});


export const onFoundOrders = createNodeDescriptor({
    type: "onFoundOrders",
    parentType: "getOrders",
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

export const onNotFoundOrders = createNodeDescriptor({
    type: "onNotFoundOrders",
    parentType: "getOrders",
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