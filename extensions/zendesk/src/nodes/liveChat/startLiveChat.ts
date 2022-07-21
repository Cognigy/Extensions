import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IStartLiveChatParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accountKey: string;
        };
        text: string;
        displayName: string;
        phone: string;
        email: string;
        addTags: boolean;
		tags: string;
        useDepartmentId: boolean;
		departmentId: string;
        sendInitialMessage: boolean;
		initialMessage: string;
    };
}
export const startLiveChatNode = createNodeDescriptor({
    type: "startLiveChat",
    defaultLabel: {
        default: "Start Live Chat",
        deDE: "Starte Live Chat",
        esES: "Iniciar Live Chat"
    },
    summary: {
        default: "Initializes the Zendesk Chat within the Cognigy Webchat",
        deDE: "Initialisiert den Zendesk Chat im Cognigy Webchat",
        esES: "Inicializa Zendesk Chat dentro de Cognigy Webchat"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Zendesk Chat Account Key",
                deDE: "Zendesk Chat Account Key",
                esES: "Clave de cuenta de Zendesk Chat"
            },
            type: "connection",
            params: {
                connectionType: "zendesk-chat-account-key",
                required: true
            }
        },
        {
            key: "text",
            label: {
                default: "Text Message",
                deDE: "Textnachricht",
                esES: "Mensaje de texto"
            },
            description: {
                default: "The message to display to the user once the handover request was sent",
                deDE: "Die Nachricht, die dem Benutzer angezeigt wird, sobald die Übergabeanforderung gesendet wurde",
                esES: "El mensaje que se mostrará al usuario una vez que se haya enviado la solicitud de traspaso"
            },
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "displayName",
            label: {
                default: "Display Name",
                deDE: "Anzeigename",
                esES: "Nombre para mostrar"
            },
            description: {
                default: "The user's name that will be displayed in Zendesk",
                deDE: "Der Name des Benutzers, der in Zendesk angezeigt wird",
                esES: "El nombre de usuario que se mostrará en Zendesk"
            },
            type: "cognigyText",
            defaultValue: "Cognigy User",
            params: {
                required: false
            }
        },
        {
            key: "email",
            label: {
                default: "Email Address",
                deDE: "E-Mail Addresse",
                esES: "Dirección de correo electrónico"
            },
            description: {
                default: "The user's email address that will be used in Zendesk",
                deDE: "Die E-Mail Adresse des Benutzers, die in Zendesk verwendet wird",
                esES: "La dirección de correo electrónico del usuario que se utilizará en Zendesk"
            },
            type: "cognigyText",
            defaultValue: "",
            params: {
                required: false
            }
        },
        {
            key: "phone",
            label: {
                default: "Phone Number",
                deDE: "Telefonnummer",
                esES: "Número de teléfono"
            },
            description: {
                default: "The user's phone number that will be used in Zendesk",
                deDE: "Die Telefonnummer des Benutzers, die in Zendesk verwendet wird",
                esES: "El número de teléfono del usuario que se utilizará en Zendesk"
            },
            type: "cognigyText",
            defaultValue: "",
            params: {
                required: false
            }
        },
        {
            key: "addTags",
            type: "toggle",
            label: {
                default: "Add tags",
                deDE: "Tags ergänzen",
                esES: "Agregar etiquetas"
            },
            description: {
                default: "Add an array of tags to the ticket.",
                deDE: "Ergänze Ticket mit einem Tags-Array.",
                esES: "Agregue una serie de etiquetas al ticket."
            },
            defaultValue: false
        },
		{
            key: "tags",
            label: {
                default: "Tags",
                deDE: "Tags",
                esES: "Etiquetas"
            },
            type: "json",
            params: {
                required: false,
            },
			defaultValue: ["enterprise", "other_tag"],
			condition: {
				key: "addTags",
				value: true
			}
        },
        {
			key: "useDepartmentId",
			type: "toggle",
			label: {
				default: "Use Department ID",
				deDE: "Department ID benutzen",
				esES: "Usar ID de departamento"
			},
			description: {
				default: "Set default department for user certain?",
				deDE: "Standardabteilung für bestimmten Benutzer festlegen?",
				esES: "¿Establecer un departamento predeterminado para un usuario determinado?"
			},
			defaultValue: false
		},
		{
			key: "departmentId",
			label: {
				default: "Department ID",
				deDE: "Department ID",
				esES: "Department ID"
			},
			type: "cognigyText",
			description: {
				default: "The department ID you wish to use.",
				deDE: "Die Department ID, die sie benutzen.",
				esES: "El ID del departamento que desea utilizar."
			},
			params: {
				required: false,
			},
			condition: {
				key: "useDepartmentId",
				value: true
			}
		},
        {
			key: "sendInitialMessage",
			type: "toggle",
			label: {
				default: "Send Initial Message to Live Agent",
				deDE: "Nachricht an Liveagent schicken",
				esES: "Enviar mensaje inicial a la agente en vivo"
			},
			description: {
				default: "Send a message to the chat, such as a transcript or other information?",
				deDE: "Senden Sie eine Nachricht an den Chat, z. B. eine Abschrift oder andere Informationen?",
				esES: "¿Enviar un mensaje al chat, como una transcripción u otra información?"
			},
			defaultValue: false
		},
		{
			key: "initialMessage",
			label: {
				default: "Initial Message",
				deDE: "Erste Nachricht",
				esES: "Mensaje inicial"
			},
			type: "cognigyText",
			params: {
				required: false,
			},
			condition: {
				key: "sendInitialMessage",
				value: true
			}
		}
    ],
    sections: [
        {
            key: "visitor",
            label: {
                default: "Visitor",
                deDE: "Besucher",
                esES: "Visitante"
            },
            defaultCollapsed: true,
            fields: [
                "displayName",
                "email",
                "phone",
            ]
        },
        {
			key: "additionalOptions",
			label: {
				default: "Additional Handover Options",
				deDE: "Zusätzliche Übergabeoptionen",
				esES: "Opciones de traspaso adicionales."
			},
			defaultCollapsed: true,
			fields: [
				"addTags",
				"tags",
                "useDepartmentId",
                "departmentId",
                "sendInitialMessage",
                "initialMessage"
			]
		}
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "text" },
        { type: "section", key: "visitor" },
        { type: "section", key: "additionalOptions"},
    ],
    appearance: {
        color: "#00363d"
    },
    function: async ({ cognigy, config }: IStartLiveChatParams) => {
        const { api } = cognigy;
        const { connection, text, displayName, email, phone, addTags, tags, useDepartmentId, departmentId, sendInitialMessage, initialMessage} = config;
        const { accountKey } = connection;

        let dataObject = {
            handover: true,
            account_key: accountKey,
            visitor: {
                display_name: displayName,
                email,
                phone
            }
        };
        if (addTags === true ) {
			dataObject["tags"] = tags;
		}
        if (useDepartmentId === true) {
            dataObject["id"] = parseInt(departmentId);
        }
        if (sendInitialMessage === true) {
            dataObject["transcript"] = initialMessage;
        }

        // Send configuration to Webchat client to start Zendesk Chat
        api.say(text, dataObject);
    }
});