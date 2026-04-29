import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface IgetSendSmsParams extends INodeFunctionBaseParams {
	config: {
        toPhoneNumber: string;
        fromPhoneNumber: string;
        bodyText: string;
        attachmentUrl?: string;
        connection: {
            token: string;
        };
	};
}

function formatPhoneNumber(phoneNumber: string): string {
    phoneNumber = String(phoneNumber).trim();
    phoneNumber = phoneNumber.replace(/[^0-9+]/g, "");

    // Already international format
    if (phoneNumber.startsWith("+")) {
        return phoneNumber;
    }

    // US number starting with 1
    if (phoneNumber.length === 11 && phoneNumber.startsWith("1")) {
        return "+" + phoneNumber;
    }

    // US number without country code (10 digits)
    if (phoneNumber.length === 10) {
        return "+1" + phoneNumber;
    }

    // Non-US number without plus
    return "+" + phoneNumber;
}

function isValidUrl(attachmentUrl: string): boolean {
    try {
        const url = new URL(attachmentUrl);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export const sendTextelMms = createNodeDescriptor({
    type: "sendTextelMms",
    defaultLabel: "Textel SMS/MMS",
    summary: "Send SMS and MMS messages via Textel",
    preview: {
        key: "toPhoneNumber",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "Textel Connection",
            type: "connection",
            params: {
                connectionType: "textelConnection",
                required: true
            }
        },
        {
            "key": "fromPhoneNumber",
            "label": "Sender Phone Number",
            "type": "cognigyText",
            "description": "The phone number that is sending the message.",
            "params": {
                "required": true
            },
            defaultValue: "8559262117"
        },
        {
            "key": "toPhoneNumber",
            "label": "Recipient Phone Number",
            "type": "cognigyText",
            "description": "The phone number that will receive the message.",
            "params": {
                "required": true
            }
        },
        {
            key: "bodyText",
            label: "Message Body",
            type: "cognigyText",
            description: "The body text of the message.",
            params: {
                required: true
            }
        },
        {
            key: "attachmentUrl",
            label: "Attachment URL",
            type: "cognigyText",
            description: "The URL of the attachment to include in the message.",
            params: {
                required: false
            }
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "toPhoneNumber" },
        { type: "field", key: "fromPhoneNumber" },
        { type: "field", key: "bodyText" },
        { type: "field", key: "attachmentUrl" },
        { type: "field", key: "connection" }
    ],
    appearance: {
        color: "#1C244A"
    },
    function: async ({ cognigy, config }: IgetSendSmsParams) => {
        const { toPhoneNumber, fromPhoneNumber, bodyText, attachmentUrl, connection } = config;
        const { api, input, context } = cognigy;

        if (!connection) {
            throw new Error("sendTextelMms: No connection provided!");
        }

        const textelConfig = {
            textelUrl: "https://foundation.textel.net/clientapi/v1/message/send",
            token: connection.token
        };

        api.log("info", `sendTextelMms: got data from Connection.  textelUrl: ${textelConfig.textelUrl}`);

        try {
            if (!toPhoneNumber || !bodyText || !fromPhoneNumber) {
                api.output("sendTextelMms Error: Missing required parameters", { error: "Missing required parameters" });
                throw new Error("sendTextelMms: Missing required parameters");
            }
            interface SmsPayload {
                to: string;
                from: string;
                attachmentUrl?: string;
                body: string;
            }
            const smsPayload: SmsPayload = {
                to: formatPhoneNumber(toPhoneNumber),
                from: formatPhoneNumber(formatPhoneNumber(fromPhoneNumber)),
                body: bodyText
            };
            if (attachmentUrl && attachmentUrl.trim().length > 0 && isValidUrl(attachmentUrl)) {
                smsPayload.attachmentUrl = attachmentUrl;
            }
            api.log("info", `sendTextelMms: about to call API URL: ${textelConfig.textelUrl} with payload: ${JSON.stringify(smsPayload)}`);
            const headers = { Authorization: `Bearer ${textelConfig.token}`, "Content-Type": "application/json" };
            const response = await fetch(textelConfig.textelUrl, { method: "POST", headers, body: JSON.stringify(smsPayload) });
            if (!response.ok) {
                throw new Error(`Error calling Textel API. Status: ${response.status}. StatusText: ${response.statusText}.`);
            }
            api.log("info", `sendTextelMms: Successfully called textel API. Status: ${response.status}. StatusText: ${response.statusText}.`);
            const data = {
                status: response.status,
                statusText: response.statusText
            };
            api.addToContext("sendTextelMms", `Sent SMS/MMS to ${toPhoneNumber}. Response: ${JSON.stringify(data)}.`, 'simple');
            // api.output("", data);
        } catch (error) {
            api.log("error", `sendTextelMms: Error sending SMS/MMS to ${toPhoneNumber}; error: ${error.message}`);
            api.addToContext("sendTextelMms", `Error sending SMS/MMS to ${toPhoneNumber}; error: ${error.message}`, 'simple');
            api.output(`Error sending SMS/MMS to ${toPhoneNumber}`, { error: error.message });
            throw error;
        }
    }
});