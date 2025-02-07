import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetTicketParams extends INodeFunctionBaseParams {
    config: {
        connectionType: string,
        userConnection: {
            username: string,
            password: string,
            subdomain: string,
        },
        apiTokenConnection: {
            emailAddress: string,
            apiToken: string,
            subdomain: string,
        },
        storeLocation: string;
        contextKey: string;
        inputKey: string;
        phoneNumberId: string;
    };
}
export const getCurrentQueueActivity = createNodeDescriptor({
    type: "getCurrentQueueActivity",
    defaultLabel: {
        default: "Get Queue Activity",
        deDE: "Warteschlangen Aktivität"
    },
    summary: {
        default: "Retrieves the current queue activity from Zendesk",
        deDE: "Erhält die aktuelle Wartenschlagen-Aktivität aus Zendesk",
    },
    fields: [
        {
            key: "connectionType",
            label: {
                default: "Connection Type",
                deDE: "Verbindungstyp",
                esES: "Tipo de conexión",
            },
            type: "select",
            defaultValue: "user",
            params: {
                required: true,
                options: [
                    {
                        label: "API Token",
                        value: "apiToken",
                    },
                    {
                        label: "User",
                        value: "user",
                    },
                ],
            },
        },
        {
            key: "userConnection",
            label: {
                default: "Zendesk Connection",
                deDE: "Zendesk Verbindung",
                esES: "Zendesk Conexión",
            },
            type: "connection",
            params: {
                connectionType: "zendesk",
                required: true,
            },
            condition: {
                key: "connectionType",
                value: "user",
            },
        },
        {
            key: "apiTokenConnection",
            label: {
                default: "Zendesk API Token Connection",
            },
            type: "connection",
            params: {
                connectionType: "zendesk-api-token",
                required: true,
            },
            condition: {
                key: "connectionType",
                value: "apiToken",
            },
        },
        {
            key: "phoneNumberId",
            type: "cognigyText",
            label: {
                default: "The requested phone number id"
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
                deDE: "Input Key zum Speichern des Ergebnisses",
                esES: "Input Key para almacenar el resultado"
            },
            defaultValue: "zendesk.currentQueueActivity",
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
                esES: "Context Key para almacenar el resultado"
            },
            defaultValue: "zendesk.currentQueueActivity",
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
        { type: "field", key: "connectionType" },
        { type: "field", key: "userConnection" },
        { type: "field", key: "apiTokenConnection" },
        { type: "field", key: "phoneNumberId"},
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#00363d"
    },
    function: async ({ cognigy, config }: IGetTicketParams) => {
        const { api } = cognigy;
        const { userConnection,
            apiTokenConnection,
            connectionType, storeLocation, contextKey, inputKey, phoneNumberId } = config;

        const { username, password, subdomain: userSubdomain } = userConnection;

        const {
            emailAddress,
            apiToken,
            subdomain: tokenSubdomain,
        } = apiTokenConnection;

        const subdomain =
            connectionType === "apiToken" ? tokenSubdomain : userSubdomain;

        try {

            const response = await axios({
                method: "get",
                url: `https://${subdomain}.zendesk.com/api/v2/channels/voice/stats/current_queue_activity`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                auth: {
                    username:
                        connectionType === "apiToken" ? `${emailAddress}/token` : username,
                    password: connectionType === "apiToken" ? apiToken : password,
                },
                params: {
                    "phone_number_ids": phoneNumberId,
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
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
