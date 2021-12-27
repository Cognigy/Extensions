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
    };
}
export const startLiveChatNode = createNodeDescriptor({
    type: "startLiveChat",
    defaultLabel: {
        default: "Start Live Chat",
        deDe: "Starte Live Chat",
        esES: "Iniciar Live Chat"
    },
    summary: {
        default: "Initializes the Zendesk Chat within the Cognigy Webchat",
        deDe: "Initialisiert den Zendesk Chat im Cognigy Webchat",
        esES: "Inicializa Zendesk Chat dentro de Cognigy Webchat"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Zendesk Chat Account Key",
                deDe: "Zendesk Chat Account Key",
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
                deDe: "Textnachricht",
                esES: "Mensaje de texto"
            },
            description: {
                default: "The message to display to the user once the handover request was sent",
                deDe: "Die Nachricht, die dem Benutzer angezeigt wird, sobald die Übergabeanforderung gesendet wurde",
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
                deDe: "Anzeigename",
                esES: "Nombre para mostrar"
            },
            description: {
                default: "The user's name that will be displayed in Zendesk",
                deDe: "Der Name des Benutzers, der in Zendesk angezeigt wird",
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
                deDe: "E-Mail Addresse",
                esES: "Dirección de correo electrónico"
            },
            description: {
                default: "The user's email address that will be used in Zendesk",
                deDe: "Die E-Mail Adresse des Benutzers, die in Zendesk verwendet wird",
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
                deDe: "Telefonnummer",
                esES: "Número de teléfono"
            },
            description: {
                default: "The user's phone number that will be used in Zendesk",
                deDe: "Die Telefonnummer des Benutzers, die in Zendesk verwendet wird",
                esES: "El número de teléfono del usuario que se utilizará en Zendesk"
            },
            type: "cognigyText",
            defaultValue: "",
            params: {
                required: false
            }
        },
    ],
    sections: [
        {
            key: "visitor",
            label: {
                default: "Visitor",
                deDe: "Besucher",
                esES: "Visitante"
            },
            defaultCollapsed: true,
            fields: [
                "displayName",
                "email",
                "phone",
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "text" },
        { type: "section", key: "visitor" },
    ],
    appearance: {
        color: "#00363d"
    },
    function: async ({ cognigy, config }: IStartLiveChatParams) => {
        const { api } = cognigy;
        const { connection, text, displayName, email, phone } = config;
        const { accountKey } = connection;

        // Send configuration to Webchat client to start Zendesk Chat
        api.say(text, {
            handover: true,
            account_key: accountKey,
            visitor: {
                display_name: displayName,
                email,
                phone
            }
        });
    }
});