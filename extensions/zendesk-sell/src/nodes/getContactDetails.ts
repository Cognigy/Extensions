import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export interface IGetContactDetailsParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
        };
        contactId: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const getContactDetailsNode = createNodeDescriptor({
    type: "getContactDetails",
    defaultLabel: {
        default: "Get Contact Details",
        deDE: "Erhalte Kontakt"
    },
    summary: {
        default: "Returns the details of a given contact by id",
        deDE: "Gibt die Details einens Kontaktes anhand der ID zurück",
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
            key: "contactId",
            label: {
                default: "Contact ID",
                deDE: "Kontakt ID"
            },
            type: "cognigyText",
            defaultValue: "{{input.zendesk.contacts[0].items[0].data.id}}",
            params: {
                required: true,
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
            defaultValue: "zendesk.contact",
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
            defaultValue: "zendesk.contact",
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
        { type: "field", key: "contactId" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#D4AE5E"
    },
    function: async ({ cognigy, config }: IGetContactDetailsParams) => {
        const { api } = cognigy;
        const { contactId, connection, storeLocation, contextKey, inputKey } = config;
        const { accessToken } = connection;

        try {

            const response = await axios({
                method: "get",
                url: `https://api.getbase.com/v2/contacts/${contactId}`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response?.data?.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response?.data?.data);
            }

        } catch (error) {

            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error });
            }
        }

    }
});