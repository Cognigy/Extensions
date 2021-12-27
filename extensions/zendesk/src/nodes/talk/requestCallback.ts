import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetTicketParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            subdomain: string;
        };
        phoneNumberId: string;
        requesterPhoneNumber: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const requestCallbackNode = createNodeDescriptor({
    type: "requestCallback",
    defaultLabel: {
		default: "Request Callback",
		deDE: "Rückruf beantragen",
		esES: "Solicitar una devolución de llamada"
	},
    summary: {
		default: "Creates a new callback request in Zendesk",
		deDE: "Erstellt eine Rückrufanfrage in Zendesk",
		esES: "Crea una nueva solicitud de devolución de llamada en Zendesk"
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
            key: "phoneNumberId",
            label: {
				default: "Phone Number ID",
				deDE: "Telefonnummer ID",
				esES: "ID del número de teléfono"
			},
            description: {
                default: "The ID of the phone number that should be used from Zendesk",
                deDE: "Die Identifikationsnummer der zu verwendenen Zendesk Telefonnummer",
                esES: "El ID del número de teléfono que se debe usar de Zendesk"
            },
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "requesterPhoneNumber",
            label: {
				default: "User Phone Number",
				deDE: "Telefonnummer der Nutzer:in",
				esES: "Número de teléfono de la usuaria"
			},
            type: "cognigyText",
            defaultValue: "+123456789",
            params: {
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
                deDE: "Input Key zum Speichern des Ergebnisses",
                esES: "Input Key para almacenar el resultado"
            },
            defaultValue: "zendesk.callbackRequest",
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
            defaultValue: "zendesk.callbackRequest",
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
        { type: "field", key: "phoneNumberId" },
        { type: "field", key: "requesterPhoneNumber" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#00363d"
    },
    function: async ({ cognigy, config }: IGetTicketParams) => {
        const { api } = cognigy;
        const { connection, phoneNumberId, requesterPhoneNumber, storeLocation, contextKey, inputKey } = config;
        const { username, password, subdomain } = connection;

        try {
            await axios({
                method: "post",
                url: `https://${subdomain}.zendesk.com/api/v2/channels/voice/callback_requests`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                auth: {
                    username,
                    password
                },
                data: {
                    callback_request: {
                        phone_number_id: phoneNumberId,
                        requester_phone_number: requesterPhoneNumber
                    }

                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, "Created", "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, "Created");
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