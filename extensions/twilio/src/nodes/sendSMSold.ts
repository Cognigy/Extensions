import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
const qs = require('qs');

export interface ISendSMSOldParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accountSid: string;
            authToken: string;
        };
        from: string;
        to: string;
        body: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}
export const SendSMSOldNode = createNodeDescriptor({
    type: "SendSMSOld",
    defaultLabel: "Send SMS Old",
    fields: [
        {
            key: "connection",
            label: "Twilio Connection",
            type: "connection",
            params: {
                connectionType: "twilio",
                required: true
            }
        },
        {
            key: "from",
            label: "Sender Number",
            type: "cognigyText",
            params: {
                required: true,
                placeholder: '+4917324375843'
            }
        },
        {
            key: "to",
            label: "Receiver Number",
            type: "cognigyText",
            params: {
                required: true,
                placeholder: '+4912644334511'
            }
        },
        {
            key: "body",
            label: "Message Body",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
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
            defaultValue: "input"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "twilio",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "twilio",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "storageOption",
            label: "Storage Option",
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
        { type: "field", key: "from" },
        { type: "field", key: "to" },
        { type: "field", key: "body" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#F22F46"
    },
    function: async ({ cognigy, config }: ISendSMSOldParams) => {
        const { api } = cognigy;
        const { connection, from, to, body, storeLocation, inputKey, contextKey } = config;
        const { accountSid, authToken } = connection;

        if (!body) throw new Error("SMS body missing or empty.");
        if (body.length > 1600) throw new Error("SMS body too long (max 1600 characters).");
        if (!from) throw new Error("The sender is missing. Define the 'from' field.");
        if (!to) throw new Error("The receiver is missing. Define a 'to' field.");

        try {

            const smsData = qs.stringify({
                'From': from,
                'Body': body.replace(/\\n/g, "\n"),
                'To': to,
                'riskCheck': "disable",
                'attempt': 3,
                'validityPeriod': 3600
            });

            const response = await axios({
                method: 'post',
                url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic '
                },
                auth: {
                    username: accountSid,
                    password: authToken
                },
                data: smsData
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }
        } catch (error) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, error, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error);
            }
        }
    }
});