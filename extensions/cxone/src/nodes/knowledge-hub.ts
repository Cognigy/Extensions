import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as jwt from "jsonwebtoken";
import getKnowledgeHubPayload from "../helpers/kh-payload.js";
import formatKnowledgeHubResponse from "../helpers/kh-response.js";
import { getToken, getCxoneOpenIdUrl, getCxoneConfigUrl, makeTokenRefresher, fetchWithAuthRetry, TokenRefresher } from "../helpers/cxone-utils.js";
import { parseJsonObjectField } from "../helpers/json-field.js";

export interface IgetKnowledgeHubParams extends INodeFunctionBaseParams {
	config: {
        bedrockKbId: string;
        environment: string;
        baseUrl?: string;
        contactId: string;
        businessNumber: string;
        userUtterance: string;
        filters: any;
        storeLocation: string;
        storeKey: string;
        connection: {
            accessKeyId: string;
            accessKeySecret: string;
            clientId: string;
            clientSecret: string;
        };
	};
}

// Function to get data from the Knowledge Hub
const getKnowledgeHubAnswer = async (api: any, apiEndpointUrl: string, token: string, contactId: string, businessNumber: string, bedrockKbId: string, userUtterance: string, filters: any, contextRefId: string, refreshToken?: TokenRefresher) => {
    const url = `${apiEndpointUrl}/eai-real-time-insight/v4/direct-query`;
    const requestBody = getKnowledgeHubPayload(businessNumber, contactId, userUtterance, bedrockKbId, filters, contextRefId);
    // query.text is what the customer said - log the request with it redacted
    const loggedBody = { ...requestBody, query: { ...requestBody.query, text: `<redacted: ${String(requestBody.query.text).length} chars>` } };
    api.log("info", `getKnowledgeHubInfo -> getKnowledgeHubAnswer: About to POST to URL: ${url}; Body (utterance redacted): ${JSON.stringify(loggedBody)};`);
    const khResponse = await fetchWithAuthRetry(api, "getKnowledgeHubInfo", token, (accessToken: string) => ({
        url,
        init: {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        }
    }), refreshToken);
    // Knowledge Hub can answer with a non-JSON error page (e.g. a gateway error) - never crash on it
    const khText = await khResponse.text();
    let khData: any;
    try {
        khData = JSON.parse(khText);
    } catch {
        api.log("error", `getKnowledgeHubInfo -> getKnowledgeHubAnswer: Knowledge Hub returned a non-JSON response (${khResponse.status}): ${khText.slice(0, 300)}`);
        khData = null;
    }
    api.log("info", `getKnowledgeHubInfo -> getKnowledgeHubAnswer: Knowledge Hub response data: ${JSON.stringify(khData)}`);
    const responseCode = khResponse.status;
    api.log("info", `getKnowledgeHubInfo -> getKnowledgeHubAnswer: khResponse.status=${khResponse.status}`);
    api.log("info", `getKnowledgeHubInfo -> getKnowledgeHubAnswer: khResponse.ok=${khResponse.ok}`);
    const khAnswer = formatKnowledgeHubResponse(khData, api, responseCode);
    api.log("info", `getKnowledgeHubInfo -> getKnowledgeHubAnswer: Formatted response is: ${JSON.stringify(khAnswer)}`);
    return khAnswer;
};

export const getKnowledgeHubInfo = createNodeDescriptor({
    type: "getKnowledgeHubInfo",
    defaultLabel: "Knowledge Hub",
    summary: "Retrieve information from the Knowledge Hub",
    preview: {
        key: "storeKey",
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
            label: "Contact ID",
            type: "cognigyText",
            description: "The CXone Contact ID.",
            defaultValue: "{{context.data.contactId}}",
            params: {
                required: true
            }
        },
        {
            key: "bedrockKbId",
            label: "Bedrock KB ID",
            type: "cognigyText",
            description: "Bedrock Knowledge Base ID from CXone Knowledge Hub.",
            params: {
                required: true
            }
        },
        {
            key: "userUtterance",
            label: "User Utterance",
            type: "cognigyText",
            description: "The user's utterance to query the Knowledge Hub.",
            params: {
                required: true
            }
        },
        {
            key: "filters",
            label: "Filters",
            type: "json",
            description: "Filters to apply to the Knowledge Hub query.",
            params: {
                required: false
            }
        },
        {
            key: "storeLocation",
            label: "Output Store Location",
            type: "select",
            description: "Choose Knowledge Hub output store location.",
            params: {
                options: [
                    { label: "Context", value: "context" },
                    { label: "Input", value: "input" }
                ],
                required: true
            },
            defaultValue: "context"
        },
        {
            key: "storeKey",
            label: "Output Store Key",
            type: "cognigyText",
            description: "The name of the property (key) where you want to store the Knowledge Hub output.",
            params: {
                required: true
            }
        },
    ],
    sections: [],
    form: [
        { type: "field", key: "environment" },
        { type: "field", key: "baseUrl" },
        { type: "field", key: "businessNumber" },
        { type: "field", key: "contactId" },
        { type: "field", key: "connection" },
        { type: "field", key: "bedrockKbId" },
        { type: "field", key: "userUtterance" },
        { type: "field", key: "filters" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: {
        color: "#3694FD"
    },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const config = rawConfig as IgetKnowledgeHubParams["config"];
        const { environment, baseUrl, userUtterance, filters, storeLocation, connection } = config;
        // identifiers and the store key are trimmed - the utterance is left exactly as the customer said it
        const contactId = (config.contactId || "").trim();
        const businessNumber = (config.businessNumber || "").trim();
        const bedrockKbId = (config.bedrockKbId || "").trim();
        const storeKey = (config.storeKey || "").trim();
        const { api, input, context } = cognigy;
        api.log?.("info", `getKnowledgeHubInfo: Business Unit Number: ${businessNumber}`);
        api.log?.("info", `getKnowledgeHubInfo: Contact ID: ${contactId}`);
        api.log?.("info", `getKnowledgeHubInfo: Bedrock KB ID: ${bedrockKbId}`);
        // the utterance is customer data - log its size, not its text
        api.log?.("info", `getKnowledgeHubInfo: User Utterance: <redacted: ${String(userUtterance || "").length} chars>`);
        api.log?.("info", `getKnowledgeHubInfo: Filters: ${JSON.stringify(filters)}`);
        api.log?.("info", `getKnowledgeHubInfo: Output store: ${storeLocation} / ${storeKey}`);

        if (!connection) {
            throw new Error("getKnowledgeHubInfo: CXone API Connection not found");
        }
        // validate the configuration before any network call is made
        if (!bedrockKbId || !userUtterance || !contactId || !businessNumber) {
            throw new Error("getKnowledgeHubInfo: Missing parameters - 'Bedrock KB ID', 'User Utterance', 'Contact ID' and 'Business Unit Number' are all required");
        }
        if (!storeKey) {
            throw new Error("getKnowledgeHubInfo: Missing 'Output Store Key' parameter");
        }
        // validate and resolve the token issuer in one block, so baseUrl is known to be set below
        let tokenIssuer = environment;
        if (environment === "other") {
            if (!baseUrl || baseUrl.trim() === "") {
                throw new Error("getKnowledgeHubInfo: Base URL is required when Environment is set to Other");
            }
            tokenIssuer = baseUrl.trim().replace(/\/+$/, ''); // remove trailing slashes
        }

        // 'Filters' is a json field, which can arrive as an object or as a JSON string
        const parsedFilters = parseJsonObjectField(api, filters, "getKnowledgeHubInfo: Filters");

        api.log?.("info", `getKnowledgeHubInfo: Contact ID: ${contactId}; Environment: ${environment}; Environment Base URL: ${tokenIssuer}`);
        // get token URL based on environment
        const tokenUrl = await getCxoneOpenIdUrl(api, context, tokenIssuer);
        api.log?.("info", `getKnowledgeHubInfo: got token URL: ${tokenUrl}`);
        const basicToken = Buffer.from(`${connection.clientId}:${connection.clientSecret}`).toString('base64');
        const cxOneConfig = {
            tokenUrl: tokenUrl,
            accessKeyId: connection.accessKeyId,
            accessKeySecret: connection.accessKeySecret,
            basicToken: basicToken
        };

        try {
            const channel = input?.channel || '';
            api.log?.("info", `getKnowledgeHubInfo: Interaction channel: ${channel}`);
            const tokens = await getToken(api, context, cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);
            const decodedToken: any = jwt.decode(tokens.id_token);
            const apiEndpointUrl = await getCxoneConfigUrl(api, context, decodedToken.iss, decodedToken.tenantId);
            api.log?.("info", `getKnowledgeHubInfo: got API endpoint URL: ${apiEndpointUrl}`);

            // Set contextRefId before call to KH
            let contextRefId = context.contextRefId || "empty";
            // lets the query survive a token that CXone considers expired
            const refreshToken = makeTokenRefresher(api, context, cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);
            const khAnswer = await getKnowledgeHubAnswer(api, apiEndpointUrl, tokens.access_token, contactId, businessNumber, bedrockKbId, userUtterance, parsedFilters, contextRefId, refreshToken);

            // Set contextRefId - to maintain conversational context for KH across turns.
            // It has to be written with addToContext: a direct assignment to the context object is not persisted.
            if (khAnswer.contextRefId && khAnswer.contextRefId !== "empty" && contextRefId === "empty") {
                contextRefId = khAnswer.contextRefId;
                api.addToContext?.("contextRefId", contextRefId, "simple");
                context.contextRefId = contextRefId; // keep the in-memory context in sync for later nodes in this execution
                api.log?.("info", `getKnowledgeHubInfo: stored contextRefId in context: ${contextRefId}`);
            }
            if (storeLocation === "context") {
                api.addToContext?.(storeKey, khAnswer, "simple");
            } else {
                // @ts-ignore
                api.addToInput(storeKey, khAnswer);
            }
            api.log?.("info", `getKnowledgeHubInfo: Stored Knowledge Hub data in ${storeLocation} under key ${storeKey}. Data: ${JSON.stringify(khAnswer)}`);
        } catch (error: any) {
            api.log?.("error", `getKnowledgeHubInfo: Error getting information from Knowledge Hub: ${error.message}`);
            api.addToContext?.("getKnowledgeHubInfo", `Error getting information from Knowledge Hub for contactId: ${contactId}; error: ${error.message}`, 'simple');
            // the error details stay in the log and in the context - they are not sent to the channel
            api.output?.("Something is not working. Please retry.", null);
            throw error;
        }
    }
});
