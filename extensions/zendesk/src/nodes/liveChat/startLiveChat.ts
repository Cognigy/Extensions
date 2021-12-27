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
    defaultLabel: "Start Live Chat",
    summary: "Initializes the Zendesk Chat within the Cognigy Webchat",
    fields: [
        {
            key: "connection",
            label: "Zendesk Chat Account Key",
            type: "connection",
            params: {
                connectionType: "zendesk-chat-account-key",
                required: true
            }
        },
        {
            key: "text",
            label: "Text Message",
            description: "The message to display to the user once the handover request was sent",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "displayName",
            label: "Display Name",
            description: "The user's name that will be displayed in Zendesk",
            type: "cognigyText",
            defaultValue: "Cognigy User",
            params: {
                required: false
            }
        },
        {
            key: "email",
            label: "Email Address",
            description: "The user's email address that will be used in Zendesk",
            type: "cognigyText",
            defaultValue: "",
            params: {
                required: false
            }
        },
        {
            key: "phone",
            label: "Phone Number",
            description: "The user's phone number that will be used in Zendesk",
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
            label: "Visitor",
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
        })
    }
});