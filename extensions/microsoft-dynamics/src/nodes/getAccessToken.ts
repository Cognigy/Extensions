import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
const qs = require('qs');

export interface IGetAccessTokenParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            clientId: string;
            clientSecret: string;
            tenantId: string;
            scope: string;
        };
        contextKey: string;
    };
}

export const getAccessTokenNode = createNodeDescriptor({
    type: "getAccessToken",
    defaultLabel: "Get Access Token",
    fields: [
        {
            key: "connection",
            label: "Microsoft Online Connection",
            type: "connection",
            params: {
                connectionType: "microsoftOnline",
                required: true
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "microsoft.auth"
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "contextKey" },
    ],
    appearance: {
        color: "#002050"
    },
    function: async ({ cognigy, config }: IGetAccessTokenParams) => {
        const { api } = cognigy;
        const { connection, contextKey } = config;
        const { clientId, clientSecret, scope, tenantId } = connection;

        const data = qs.stringify({
            'client_id': clientId,
            'client_secret': clientSecret,
            'grant_type': 'client_credentials',
            'Scope': scope
        });

        try {
            // Try to get the access token from the Microsoft Dynamics Login Service
            const response = await axios({
                url: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
                method: "post",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data
            });

            api.addToContext(contextKey, response.data, "simple");

        } catch (error) {
            api.addToContext(contextKey, error, "simple");
        }
    }
});