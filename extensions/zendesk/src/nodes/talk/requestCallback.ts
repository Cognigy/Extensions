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
    defaultLabel: "Request Callback",
    summary: "Creates a new callback request in Zendesk",
    fields: [
        {
            key: "connection",
            label: "Zendesk Connection",
            type: "connection",
            params: {
                connectionType: "zendesk",
                required: true
            }
        },
        {
            key: "phoneNumberId",
            label: "Phone Number Id",
            description: "The ID of the phone number that should be used from Zendesk",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "requesterPhoneNumber",
            label: "User Phone Number",
            description: "The phone number of the user",
            type: "cognigyText",
            defaultValue: "+123456789",
            params: {
                required: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
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
            label: "Input Key to store Result",
            defaultValue: "zendesk.callbackRequest",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
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
            label: "Storage Option",
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