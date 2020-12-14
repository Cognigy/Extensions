import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AccessToken } from "../../types/uipath";

export interface IOnPremAuthenticationParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            orchestratorUrl: string;
            tenancyName: string;
            usernameOrEmailAddress: string;
            password: string;
        };
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const onPremAuthenticationNode = createNodeDescriptor({
    type: "onPremAuthentication",
    defaultLabel: "On-Premise Authentication",
    fields: [
        {
            key: "onPremAuthConnection",
            label: "UiPath On-Prem Connection",
            type: "connection",
            params: {
                connectionType: "onPremAuth",
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
            defaultValue: "uiPathAccessToken",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "uiPathAccessToken",
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
        { type: "field", key: "onPremAuthConnection" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#fa4514"
    },
    function: async ({ cognigy, config }: IOnPremAuthenticationParams) => {
        const { api } = cognigy;
        const { connection, storeLocation, inputKey, contextKey } = config;
        const { tenancyName, orchestratorUrl, password, usernameOrEmailAddress } = connection;

        const endpoint = `https://${orchestratorUrl}/api/account/authenticate`;
        const axiosConfig: AxiosRequestConfig = {
            "headers":
            {
                "Content-Type": "application/json"
            }
        };
        try {
            const response: AxiosResponse<AccessToken> = await axios.post(endpoint, {
                tenancyName,
                usernameOrEmailAddress,
                password
            }, axiosConfig);
            if (storeLocation === 'context') {
                api.addToContext(contextKey, response.data.access_token, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data.access_token);
            }
        } catch (error) {
            if (storeLocation === 'context') {
                api.addToContext(contextKey, { error: error.message }, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error.message });
            }
        }
    }
});