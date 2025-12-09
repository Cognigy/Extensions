import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as jwt from "jsonwebtoken";
import { getToken, getCxoneOpenIdUrl, getCxoneConfigUrl, sendSignal } from "../helpers/cxone-utils";

export interface IgetSendSignalParams extends INodeFunctionBaseParams {
    config: {
        contactId: string;
        signalParams: any;
        connection: {
            environmentUrl: string;
            accessKeyId: string;
            accessKeySecret: string;
            clientId: string;
            clientSecret: string;
        };
    };
}

export const sendSignalToCXone = createNodeDescriptor({
    type: "sendCxoneSignal",
    defaultLabel: "Signal Interaction",
    summary: "Signal CXone with arbitrary parameters",
    preview: {
        key: "action",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "CXone Connection",
            type: "connection",
            description: "Select the CXone connection to use, or create one.",
            params: {
                connectionType: "cxoneConnection",
                required: true
            }
        },
        {
            key: "contactId",
            label: "Contact ID",
            type: "cognigyText",
            description: "The CXone Contact ID.",
            params: {
                required: true
            }
        },
        {
            key: "signalParams",
            label: "Signal Parameters",
            type: "json",
            defaultValue: "[]",
            description: "Parameters to include in signal. Provide parameter values as an array of strings.",
            params: {
                required: true
            }
        },
    ],
    sections: [],
    form: [
        { type: "field", key: "contactId" },
        { type: "field", key: "connection" },
        { type: "field", key: "signalParams" }
    ],
    appearance: {
        color: "#3694FD"
    },
    function: async ({ cognigy, config }: IgetSendSignalParams) => {
        const { contactId, signalParams, connection } = config;
        const { api, input, context } = cognigy;

        if (!connection.environmentUrl || connection.environmentUrl.trim() === "") {
            throw new Error("sendSignalToCXone: Environment URL is required in connection configuration");
        }

        const tokenIssuer = connection.environmentUrl.trim().replace(/\/+$/, ''); // remove trailing slashes

        api.log("info", `sendSignalToCXone: Contact ID: ${contactId}; Environment URL: ${tokenIssuer}`);
        // get token URL based on environment
        const tokenUrl = await getCxoneOpenIdUrl(api, context, tokenIssuer);
        api.log("info", `sendSignalToCXone: got token URL: ${tokenUrl}`);
        const basicToken = Buffer.from(`${connection.clientId}:${connection.clientSecret}`).toString('base64');
        const cxOneConfig = {
            tokenUrl: tokenUrl,
            accessKeyId: connection.accessKeyId,
            accessKeySecret: connection.accessKeySecret,
            basicToken: basicToken
        };

        try {
            const channel = input?.channel || '';
            api.log("info", `sendSignalToCXone: Interaction channel: ${channel}`);
            const isVoice = channel.toLowerCase().includes('voice');
            api.log("info", `sendSignalToCXone: isVoice: ${isVoice}`);
            if (contactId && isVoice) {
                const tokens = await getToken(api, context, cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);
                const decodedToken: any = jwt.decode(tokens.id_token);
                // api.log("info", `sendSignalToCXone: decoded id token: ${JSON.stringify(decodedToken)}`);
                const apiEndpointUrl = await getCxoneConfigUrl(api, context, decodedToken.iss, decodedToken.tenantId);
                api.log("info", `sendSignalToCXone: got API endpoint URL: ${apiEndpointUrl}`);
                const signalStatus = await sendSignal(api, apiEndpointUrl, tokens.access_token, contactId, signalParams || []);
                api.log("info", `sendSignalToCXone: sent signal to CXone for contactId: ${contactId}; status: ${signalStatus}`);
                api.addToContext("CXoneSendSignal", `CXone was Signaled for contactId: ${contactId}, with parameters: ${JSON.stringify(signalParams)}`, 'simple');
            }

            // data for CXone chat channel - to end conversation or escalate to agent
            const data: { Intent: string; Params?: string } = {
                Intent: "Signal"
            };
            if (Array.isArray(signalParams) && signalParams.length) {
                data.Params = signalParams.join('|');
            }
            api.output(null, data);
        } catch (error) {
            api.log("error", `sendSignalToCXone: Error signaling '${JSON.stringify(signalParams)}' for contactId: ${contactId}; error: ${error.message}`);
            api.addToContext("CXoneSendSignal", `Error signaling '${JSON.stringify(signalParams)}' for contactId: ${contactId}; error: ${error.message}`, 'simple');
            api.output("Something is not working. Please retry.", { error: error.message });
            throw error;
        }
    }
});