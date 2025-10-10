import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as jwt from "jsonwebtoken";
import transformConversation from '../helpers/get-tms-payload';
import { getToken, getCxoneOpenIdUrl, getCxoneConfigUrl, sendSignalHandover, postToTMS } from "../helpers/cxone-utils";

export interface IgetSendSignalParams extends INodeFunctionBaseParams {
    config: {
        environment: string;
        baseUrl?: string;
        action: string;
        contactId: string;
        spawnedContactId: string;
        businessNumber: string;
        connection: {
            accessKeyId: string;
            accessKeySecret: string;
            clientId: string;
            clientSecret: string;
        };
    };
}

export const handoverToCXone = createNodeDescriptor({
    type: "handoverToCXone",
    defaultLabel: "CXone Handover",
    summary: "Handover control to CXone",
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
            description: "The Base URL (Issuer) for the CXone environment.",
            condition: { key: "environment", value: "other" },
            params: {
                required: true
            },
            defaultValue: "https://cxone.niceincontact.com"
        },
        {
            key: "action",
            label: "Handover Action",
            type: "select",
            description: "Choose the action to perform. It will be passed to CXone.",
            params: {
                options: [
                    { label: "Escalate to Agent", value: "Escalate" },
                    { label: "End Conversation", value: "End" }
                ],
                required: true
            }
        },
        {
            key: "businessNumber",
            label: "Business Unit Number",
            type: "cognigyText",
            description: "The CXone Business Unit Number.",
            params: {
                required: true
            }
        },
        {
            key: "contactId",
            label: "Main Contact ID",
            type: "cognigyText",
            description: "The CXone Main Contact ID.",
            params: {
                required: true
            }
        },
        {
            key: "spawnedContactId",
            label: "Spawned Contact ID",
            type: "cognigyText",
            description: "The CXone Spawned Contact ID.",
            params: {
                required: true
            }
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "environment" },
        { type: "field", key: "baseUrl" },
        { type: "field", key: "action" },
        { type: "field", key: "businessNumber" },
        { type: "field", key: "contactId" },
        { type: "field", key: "spawnedContactId" },
        { type: "field", key: "connection" }
    ],
    appearance: {
        color: "#ff9933"
    },
    function: async ({ cognigy, config }: IgetSendSignalParams) => {
        const { environment, baseUrl, action, businessNumber, contactId, spawnedContactId, connection } = config;
        const { api, input, context } = cognigy;

        if (!connection) {
            throw new Error("handoverToCXone: CXone API Connection not found");
        }
        if (environment === "other") {
            if (!baseUrl || baseUrl.trim() === "") {
                throw new Error("handoverToCXone: Base URL is required when Environment is set to Other");
            }
        }
        if (!action) {
            api.output("handoverToCXone Error: Missing Action parameter", { error: "Missing Action parameter" });
            throw new Error("handoverToCXone: Missing Action parameter");
        }

        let tokenIssuer = environment;
        if (environment === "other") {
            tokenIssuer = baseUrl.trim().replace(/\/+$/, ''); // remove trailing slashes
        }

        api.log("info", `handoverToCXone: Contact ID: ${contactId}; Spawned Contact ID: ${spawnedContactId}; Action: ${action}; Environment: ${environment}; Environment Base URL: ${tokenIssuer}`);
        // get token URL based on environment
        // i.e.: "https://cxone.niceincontact.com/auth/token";
        const tokenUrl = await getCxoneOpenIdUrl(tokenIssuer);
        api.log("info", `handoverToCXone: got token URL: ${tokenUrl}`);
        const basicToken = Buffer.from(`${connection.clientId}:${connection.clientSecret}`).toString('base64');
        const cxOneConfig = {
            tokenUrl: tokenUrl,
            accessKeyId: connection.accessKeyId,
            accessKeySecret: connection.accessKeySecret,
            basicToken: basicToken
        };

        try {
            const channel = input?.channel || '';
            api.log("info", `handoverToCXone: Interaction channel: ${channel}`);
            const isVoice = channel.toLowerCase().includes('voice');
            api.log("info", `handoverToCXone: isVoice: ${isVoice}`);
            if (contactId && spawnedContactId && isVoice) {
                const tokens = await getToken(cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);
                const decodedToken: any = jwt.decode(tokens.id_token);
                api.log("info", `handoverToCXone: decoded id token:  ${JSON.stringify(decodedToken)}`);

                const apiEndpointUrl = await getCxoneConfigUrl(decodedToken.iss, decodedToken.tenantId);
                api.log("info", `handoverToCXone: got API endpoint URL: ${apiEndpointUrl}`);

                const transcript = input.transcript || context.transcript || '';
                // Send transcript to TMS if available
                if (transcript) {
                    api.log("info", `handoverToCXone: got transcript`);
                    try {
                        const tmsPayload = transformConversation(transcript, action as "End" | "Escalate", contactId, businessNumber);
                        const tmsStatus = await postToTMS(api, apiEndpointUrl, tokens.access_token, tmsPayload);
                        api.log("info", `handoverToCXone: posted transcript to TMS for contactId: ${contactId}; status: ${tmsStatus}; payload: ${JSON.stringify(tmsPayload)}`);
                    } catch (tmsError) {
                        api.log("error", `handoverToCXone: Error posting transcript to TMS for contactId: ${contactId}; error: ${tmsError.message}`);
                    }
                }
                const signalStatus = await sendSignalHandover(api, apiEndpointUrl, tokens.access_token, spawnedContactId || contactId, action, []);
                api.log("info", `handoverToCXone: sent signal to CXone for contactId: ${contactId}; action: ${action}; status: ${signalStatus}`);
            }

            // data for CXone chat channel - to end conversation or escalate to agent
            const data = {
                Intent: action
            };

            api.addToContext("CXoneSendSignal", `CXone Signaled '${action}' for contactId: ${contactId}`, 'simple');
            api.output("", data);
        } catch (error) {
            api.log("error", `handoverToCXone: Error signaling '${action}' for contactId: ${contactId}; error: ${error.message}`);
            api.addToContext("CXoneSendSignal", `Error signaling '${action}' for contactId: ${contactId}; error: ${error.message}`, 'simple');
            api.output(`Error signaling '${action}': ${error.message}`, { error: error.message });
            throw error;
        }
    }
});