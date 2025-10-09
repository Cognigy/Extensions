import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as jwt from "jsonwebtoken";
import transformConversation from './get-tms-payload';

export interface IgetSendSignalParams extends INodeFunctionBaseParams {
    config: {
        environment: string;
        baseUrl?: string;
        action: string;
        contactId: string;
        businessNumber: string;
        optionalParams: any;
        connection: {
            username: string;
            password: string;
            basicToken: string;
        };
    };
}

// Function to get bearer token
const getToken = async (bToken: string, uValue: string, pValue: string, tokenUrl: string) => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": "Basic " + bToken
  };
  const body = new URLSearchParams({ grant_type: "password", username: uValue, password: pValue });
  const response = await fetch(tokenUrl, { method: "POST", headers, body });
  if (!response.ok) {
    throw new Error(`sendSignalToCXone -> getToken: Error getting bearer token: ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
};

// Function to get token URL via discovery service
const getCxoneOpenIdUrl = async (issuer: string) => {
    const url = `${issuer}/.well-known/openid-configuration`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`sendSignalToCXone -> getCxoneOpenIdUrl: Error getting token URL: ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.token_endpoint) {
        throw new Error(`sendSignalToCXone -> getCxoneOpenIdUrl: Token Endpoint URL not found in discovery response`);
    }
    return data.token_endpoint;
};

// Function to get API endpoint via discovery service
const getCxoneConfigUrl = async (issuer: string, tenant: string) => {
    const url = `${issuer}/.well-known/cxone-configuration?tenantId=${tenant}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`sendSignalToCXone -> getCxoneConfigUrl: Error getting endpoint URL: ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.api_endpoint) {
        throw new Error(`sendSignalToCXone -> getCxoneConfigUrl: API endpoint not found in discovery response`);
    }
    return data.api_endpoint;
};

// Function to send signal to CXone
const sendSignal = async (api: any, apiEndpointUrl: string, token: string, contactId: string, action: string, otherParms: any[] = []) => {
    let url = `${apiEndpointUrl}/inContactAPI/services/v30.0/interactions/${encodeURIComponent(contactId)}/signal?p1=${encodeURIComponent(action)}`;
    otherParms.forEach((val, index) => url += `&p${index + 2}=${encodeURIComponent(val)}`);
    api.log("info", `sendSignalToCXone -> sendSignal: About to signal to URL: ${url}`);
    const headers = { Authorization: `Bearer ${token}` };
    const response = await fetch(url, { method: "POST", headers });
    if (!response.ok) {
        throw new Error(`Error sending signal: ${response.status}: ${response.statusText}`);
    }
    return response.status;
};

// Function to post transcript to TMS
const postToTMS = async (api: any, apiEndpointUrl: string, token: string, tmsPayload: any) => {
    const url = `${apiEndpointUrl}/aai/tms/transcripts/post`;
    api.log("info", `sendSignalToCXone -> postToTMS: About to post to URL: ${url}`);
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(tmsPayload) });
    if (!response.ok) {
        throw new Error(`Error posting to TMS: ${response.status}: ${response.statusText}`);
    }
    return response.status;
};

export const sendSignalToCXone = createNodeDescriptor({
    type: "sendCxoneSignal",
    defaultLabel: "Signal CXone",
    summary: "Send signal to CXone",
    preview: {
        key: "action",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "CXone API Connection",
            type: "connection",
            description: "Select the CXone API connection to use, or create one.",
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
            label: "Base URL",
            type: "text",
            description: "The Base URL for the CXone environment (Issuer).",
            condition: { key: "environment", value: "other" },
            params: {
                required: true
            },
            defaultValue: "https://cxone.niceincontact.com"
        },
        {
            key: "action",
            label: "Action",
            type: "select",
            description: "Choose the action to perform. It will be signaled to CXone Studio.",
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
            },
            defaultValue: "4597359"
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
            key: "optionalParams",
            label: "Optional Parameters",
            type: "json",
            defaultValue: "[]",
            description: "Optional additional parameters to include in the signal. Provide them as an array of strings.",
            params: {
                required: false
            }
        },
    ],
    sections: [
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: [
                "optionalParams"
            ],
        }
    ],
    form: [
        { type: "field", key: "environment" },
        { type: "field", key: "baseUrl" },
        { type: "field", key: "action" },
        { type: "field", key: "businessNumber" },
        { type: "field", key: "contactId" },
        { type: "section", key: "advanced" },
        { type: "field", key: "connection" }
    ],
    appearance: {
        color: "#ff9933"
    },
    function: async ({ cognigy, config }: IgetSendSignalParams) => {
        const { environment, baseUrl, action, businessNumber, contactId, optionalParams, connection } = config;
        const { api, input, context } = cognigy;

        // api.log("info", `sendSignalToCXone: Got input: ${JSON.stringify(input)}`);
        // api.log("info", `sendSignalToCXone: Got context: ${JSON.stringify(context)}`);
        api.log("info", `sendSignalToCXone: Contact ID: ${contactId}`);

        if (!connection) {
            throw new Error("sendSignalToCXone: CXone API Connection not found");
        }
        if (environment === "other") {
            if (!baseUrl || baseUrl.trim() === "") {
                throw new Error("sendSignalToCXone: Base URL is required when Environment is set to Other");
            }
        }

        // const basicToken = Buffer.from(`${connection.username}:${connection.password}`).toString('base64');

        // api.log("info", `sendSignalToCXone: username: ${connection.username}`);
        // api.log("info", `sendSignalToCXone: password: ${connection.password}`);
        // api.log("info", `sendSignalToCXone: concat: ${connection.username}:${connection.password}`);
        // api.log("info", `sendSignalToCXone: basicToken: ${basicToken}`);

        // get token URL based on environment
        // i.e.: "https://cxone.niceincontact.com/auth/token";
        let tokenIssuer = environment;
        if (environment === "other") {
            tokenIssuer = baseUrl.trim().replace(/\/+$/, ''); // remove trailing slashes
        }

        const tokenUrl = await getCxoneOpenIdUrl(tokenIssuer);
        api.log("info", `sendSignalToCXone: got token URL: ${tokenUrl}`);

        const cxOneConfig = {
            tokenUrl: tokenUrl,
            username: connection.username,
            password: connection.password,
            basicToken: connection.basicToken
        };

        api.log("info", `sendSignalToCXone: got data from Connection.  basicToken: ${cxOneConfig.basicToken}`);

        try {
            if (!action) {
                api.output("sendSignalToCXone Error: Missing Action parameter", { error: "Missing Action parameter" });
                throw new Error("sendSignalToCXone: Missing Action parameter");
            }

            const channel = input?.channel || '';
            api.log("info", `sendSignalToCXone: Interaction channel: ${channel}`);
            const isVoice = channel.toLowerCase().includes('voice');
            api.log("info", `sendSignalToCXone: isVoice: ${isVoice}`);
            if (contactId && isVoice) {
                const tokens = await getToken(cxOneConfig.basicToken, cxOneConfig.username, cxOneConfig.password, cxOneConfig.tokenUrl);
                api.log("info", `sendSignalToCXone: got access token: ${tokens.access_token}`);

                const decodedToken: any = jwt.decode(tokens.id_token);
                api.log("info", `sendSignalToCXone: decoded id token:  ${JSON.stringify(decodedToken)}`);

                const apiEndpointUrl = await getCxoneConfigUrl(decodedToken.iss, decodedToken.tenantId);
                api.log("info", `sendSignalToCXone: got API endpoint URL: ${apiEndpointUrl}`);

                const transcript = input.transcript || context.transcript || '';
                // Send transcript to TMS if available
                if (transcript) {
                    api.log("info", `sendSignalToCXone: got transcript: ${JSON.stringify(transcript)}`);
                    try {
                        const tmsPayload = transformConversation(transcript, action as "End" | "Escalate", contactId, businessNumber);
                        api.log("info", `sendSignalToCXone: about to post to TMS: ${JSON.stringify(tmsPayload)}`);
                        const tmsStatus = await postToTMS(api, apiEndpointUrl, tokens.access_token, tmsPayload);
                        api.log("info", `sendSignalToCXone: posted transcript to TMS for contactId: ${contactId}; status: ${tmsStatus}`);
                    } catch (tmsError) {
                        api.log("error", `sendSignalToCXone: Error posting transcript to TMS for contactId: ${contactId}; error: ${tmsError.message}`);
                    }
                }
                const signalStatus = await sendSignal(api, apiEndpointUrl, tokens.access_token, contactId, action, optionalParams || []);
                api.log("info", `sendSignalToCXone: sent signal to CXone for contactId: ${contactId}; action: ${action}; status: ${signalStatus}`);
            }

            // data for CXone chat channel - to end conversation or escalate to agent
            const data = {
                Intent: action
            };

            api.addToContext("CXoneSendSignal", `CXone Signaled '${action}' for contactId: ${contactId}`, 'simple');
            api.output("", data);
        } catch (error) {
            api.log("error", `sendSignalToCXone: Error signaling '${action}' for contactId: ${contactId}; error: ${error.message}`);
            api.addToContext("CXoneSendSignal", `Error signaling '${action}' for contactId: ${contactId}; error: ${error.message}`, 'simple');
            api.output(`Error signaling '${action}': ${error.message}`, { error: error.message });
            throw error;
        }
    }
});