import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as jwt from "jsonwebtoken";
import { getToken, getCxoneOpenIdUrl, getCxoneConfigUrl, sendSignal, makeTokenRefresher } from "../helpers/cxone-utils.js";
import { parseJsonArrayField } from "../helpers/json-field.js";

export interface IgetSendSignalParams extends INodeFunctionBaseParams {
    config: {
        environment: string;
        baseUrl?: string;
        contactId: string;
        signalParams: any;
        connection: {
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
        key: "contactId",
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
            key: "environment",
            label: "Environment",
            type: "select",
            description: "The CXone environment.",
            defaultValue: "https://cxone.niceincontact.com",
            params: {
                options: [
                    { label: "Global Production", value: "https://cxone.niceincontact.com" },
                    { label: "FedRAMP Moderate", value: "https://cxone-gov.niceincontact.com" },
                    { label: "Australian Sovereign", value: "https://nicecxone-sov1.au" },
                    { label: "EU Sovereign", value: "https://nicecxone-sov1.eu" },
                    { label: "Other", value: "other" }
                ],
                required: true
            }
        },
        {
            key: "baseUrl",
            label: "Environment Base URL",
            type: "text",
            // no default: this field only appears for 'Other', where pre-filling a listed
            // environment would quietly point the node somewhere the builder did not choose
            description: "The Base URL (Issuer) of your CXone environment, e.g. https://cxone.niceincontact.com",
            condition: { key: "environment", value: "other" },
            params: {
                required: true
            }
        },
        {
            key: "contactId",
            label: "Contact ID",
            type: "cognigyText",
            description: "The CXone Contact ID.",
            defaultValue: "{{context.data.contactId}}",
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
        { type: "field", key: "environment" },
        { type: "field", key: "baseUrl" },
        { type: "field", key: "contactId" },
        { type: "field", key: "connection" },
        { type: "field", key: "signalParams" }
    ],
    appearance: {
        color: "#3694FD"
    },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const config = rawConfig as IgetSendSignalParams["config"];
        const { environment, baseUrl, signalParams, connection } = config;
        // trimmed: whitespace would end up encoded in the signal URL and target no interaction
        const contactId = (config.contactId || "").trim();
        const { api, input, context } = cognigy;

        if (!connection) {
            throw new Error("sendSignalToCXone: CXone API Connection not found");
        }
        // validate and resolve the token issuer in one block, so baseUrl is known to be set below
        let tokenIssuer = environment;
        if (environment === "other") {
            if (!baseUrl || baseUrl.trim() === "") {
                throw new Error("sendSignalToCXone: Base URL is required when Environment is set to Other");
            }
            tokenIssuer = baseUrl.trim().replace(/\/+$/, ''); // remove trailing slashes
        }

        // 'Signal Parameters' is a json field: normalize it and make sure every value is a string
        const parsedSignalParams = parseJsonArrayField(api, signalParams, "sendSignalToCXone: Signal Parameters")
            .filter(param => param !== null && param !== undefined)
            .map(param => typeof param === "string" ? param : (typeof param === "object" ? JSON.stringify(param) : String(param)));
        api.log?.("info", `sendSignalToCXone: signal parameters: ${JSON.stringify(parsedSignalParams)}`);

        api.log?.("info", `sendSignalToCXone: Contact ID: ${contactId}; Environment: ${environment}; Environment Base URL: ${tokenIssuer}`);

        try {
            const channel = input?.channel || '';
            api.log?.("info", `sendSignalToCXone: Interaction channel: ${channel}`);
            const isVoice = channel.toLowerCase().includes('voice');
            api.log?.("info", `sendSignalToCXone: isVoice: ${isVoice}`);
            if (contactId && isVoice) {
                // CXone needs at least p1 - fail with a clear message instead of a generic API error
                if (!parsedSignalParams.length) {
                    throw new Error("sendSignalToCXone: 'Signal Parameters' must contain at least one value (sent as p1)");
                }
                // resolve the token URL only when a signal is actually sent (not needed on chat channels)
                const tokenUrl = await getCxoneOpenIdUrl(api, context, tokenIssuer);
                api.log?.("info", `sendSignalToCXone: got token URL: ${tokenUrl}`);
                const basicToken = Buffer.from(`${connection.clientId}:${connection.clientSecret}`).toString('base64');
                const cxOneConfig = {
                    tokenUrl: tokenUrl,
                    accessKeyId: connection.accessKeyId,
                    accessKeySecret: connection.accessKeySecret,
                    basicToken: basicToken
                };

                const tokens = await getToken(api, context, cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);
                const decodedToken: any = jwt.decode(tokens.id_token);
                const apiEndpointUrl = await getCxoneConfigUrl(api, context, decodedToken.iss, decodedToken.tenantId);
                api.log?.("info", `sendSignalToCXone: got API endpoint URL: ${apiEndpointUrl}`);
                const refreshToken = makeTokenRefresher(api, context, cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);
                const signalStatus = await sendSignal(api, apiEndpointUrl, tokens.access_token, contactId, parsedSignalParams, refreshToken);
                api.log?.("info", `sendSignalToCXone: sent signal to CXone for contactId: ${contactId}; status: ${signalStatus}`);
                api.addToContext?.("CXoneSendSignal", `CXone was Signaled for contactId: ${contactId}, with parameters: ${JSON.stringify(parsedSignalParams)}`, 'simple');
            }

            // data for CXone chat channel - to end conversation or escalate to agent
            const data: { Intent: string; Params?: string } = {
                Intent: "Signal"
            };
            if (parsedSignalParams.length) {
                data.Params = parsedSignalParams.join('|');
            }
            api.output?.("", data);
        } catch (error: any) {
            api.log?.("error", `sendSignalToCXone: Error signaling '${JSON.stringify(parsedSignalParams)}' for contactId: ${contactId}; error: ${error.message}`);
            api.addToContext?.("CXoneSendSignal", `Error signaling '${JSON.stringify(parsedSignalParams)}' for contactId: ${contactId}; error: ${error.message}`, 'simple');
            // the error details stay in the log and in the context - they are not sent to the channel
            api.output?.("Something is not working. Please retry.", null);
            throw error;
        }
    }
});
