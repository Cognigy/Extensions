import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ICheckVerifyPinParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            apiKey: string;
            apiSecret: string;
        };
        requestId: string;
        code: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const checkVerifyPinNode = createNodeDescriptor({
    type: "checkVerifyPin",
    defaultLabel: "Check Verify Pin",
    summary: "Checks a verify pin",
    fields: [
        {
            key: "connection",
            label: "Vonage Connection",
            type: "connection",
            params: {
                connectionType: "vonage",
                required: true
            }
        },
        {
            key: "requestId",
            label: "Request ID",
            type: "cognigyText",
            defaultValue: "{{input.vonage.pin.request_id}}",
            params: {
                required: true
            }
        },
        {
            key: "code",
            label: "Verify Pin",
            description: "The verification pin the user sent",
            type: "cognigyText",
            defaultValue: "{{input.text}}",
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
            defaultValue: "vonage.check",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "vonage.check",
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
                "contextKey",
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "requestId" },
        { type: "field", key: "code" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#fff"
    },
    dependencies: {
        children: [
            "onValid",
            "onInvalid"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ICheckVerifyPinParams) => {
        const { api } = cognigy;
        const { connection, requestId, code, storeLocation, inputKey, contextKey } = config;
        const { apiKey, apiSecret } = connection;

        try {
            const response = await axios({
                method: "get",
                url: `https://api.nexmo.com/verify/check/json?&api_key=${apiKey}&api_secret=${apiSecret}&request_id=${requestId}&code=${code}`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            if (response.data.error_text) {
                const onInvalidChild = childConfigs.find(child => child.type === "onInvalid");
                api.setNextNode(onInvalidChild.id);
            } else {
                const onValidChild = childConfigs.find(child => child.type === "onValid");
                api.setNextNode(onValidChild.id);
            }

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }
        } catch (error) {

            const onInvalidChild = childConfigs.find(child => child.type === "onInvalid");
            api.setNextNode(onInvalidChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, error.message, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error.message);
            }
        }
    }
});

export const onValid = createNodeDescriptor({
    type: "onValid",
    parentType: "checkVerifyPin",
    defaultLabel: "On Valid",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onInvalid = createNodeDescriptor({
    type: "onInvalid",
    parentType: "checkVerifyPin",
    defaultLabel: "On Invalid",
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});
