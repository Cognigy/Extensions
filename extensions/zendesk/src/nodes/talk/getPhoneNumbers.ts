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
    };
}
export const getPhoneNumbersNode = createNodeDescriptor({
    type: "getPhoneNumbers",
    defaultLabel: {
        default: "Get Phone Numbers",
        deDE: "Erhalte Telefonnummern",
        esES: "Obtener números de teléfono"
    },
    summary: {
        default: "Retrieves the list of phone numbers from Zendesk",
        deDE: "Erhält eine Liste von Telefonnummern aus Zendesk",
        esES: "Recupera la lista de números de teléfono de Zendesk"
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
            defaultValue: "zendesk.phoneNumbers",
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
            defaultValue: "zendesk.phoneNumbers",
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
    { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#00363d"
    },
    function: async ({ cognigy, config }: IGetTicketParams) => {
        const { api } = cognigy;
        const { userConnection,
            apiTokenConnection,
            connectionType, storeLocation, contextKey, inputKey } = config;

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
                url: `https://${subdomain}.zendesk.com/api/v2/channels/voice/phone_numbers`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                auth: {
                    username:
                        connectionType === "apiToken" ? `${emailAddress}/token` : username,
                    password: connectionType === "apiToken" ? apiToken : password,
                },
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data.phone_numbers, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data.phone_numbers);
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
