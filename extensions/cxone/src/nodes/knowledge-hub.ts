import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as jwt from "jsonwebtoken";
import getKnowledgeHubPayload from "../helpers/kh-payload";
import formatKnowledgeHubResponse from "../helpers/kh-response";
import { getToken, getCxoneOpenIdUrl, getCxoneConfigUrl } from "../helpers/cxone-utils";

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
const getKnowledgeHubAnswer = async (api: any, apiEndpointUrl: string, token: string, contactId: string, businessNumber: string, bedrockKbId: string, userUtterance: string, filters: any, contextRefId: string) => {
    const url = `${apiEndpointUrl}/eai-real-time-insight/v4/direct-query`;
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
    const requestBody = getKnowledgeHubPayload(businessNumber, contactId, userUtterance, bedrockKbId, filters, contextRefId);
    api.log("info", `getKnowledgeHubInfo -> getKnowledgeHubAnswer: About to POST to URL: ${url}; Body: ${JSON.stringify(requestBody)};`);
    const khResponse = await fetch(url, { method: "POST", headers, body: JSON.stringify(requestBody) });
    const khData = await khResponse.json();
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
    defaultLabel: "Query Knowledge Hub",
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
            description: "The Base URL (Issuer) for the CXone environment.",
            condition: { key: "environment", value: "other" },
            params: {
                required: true
            },
            defaultValue: "https://cxone.niceincontact.com"
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
    function: async ({ cognigy, config }: IgetKnowledgeHubParams) => {
        const { environment, baseUrl, contactId, bedrockKbId, businessNumber, userUtterance, filters, storeKey, storeLocation, connection } = config;
        const { api, input, context } = cognigy;
        api.log("info", `getKnowledgeHubInfo: Business Unit Number: ${businessNumber}`);
        api.log("info", `getKnowledgeHubInfo: Contact ID: ${contactId}`);
        api.log("info", `getKnowledgeHubInfo: Bedrock KB ID: ${bedrockKbId}`);
        api.log("info", `getKnowledgeHubInfo: User Utterance: ${userUtterance}`);
        api.log("info", `getKnowledgeHubInfo: Filters: ${JSON.stringify(filters)}`);

        if (!connection) {
            throw new Error("getKnowledgeHubInfo: CXone API Connection not found");
        }

        let tokenIssuer = environment;
        if (environment === "other") {
            tokenIssuer = baseUrl.trim().replace(/\/+$/, ''); // remove trailing slashes
        }

        api.log("info", `getKnowledgeHubInfo: Contact ID: ${contactId}; Environment: ${environment}; Environment Base URL: ${tokenIssuer}`);
        // get token URL based on environment
        const tokenUrl = await getCxoneOpenIdUrl(api, context, tokenIssuer);
        api.log("info", `getKnowledgeHubInfo: got token URL: ${tokenUrl}`);
        const basicToken = Buffer.from(`${connection.clientId}:${connection.clientSecret}`).toString('base64');
        const cxOneConfig = {
            tokenUrl: tokenUrl,
            accessKeyId: connection.accessKeyId,
            accessKeySecret: connection.accessKeySecret,
            basicToken: basicToken
        };

        try {
            if (!bedrockKbId || !userUtterance || !contactId || !businessNumber) {
                api.output("getKnowledgeHubInfo Error: Missing parameters", { error: "Missing parameters" });
                throw new Error("getKnowledgeHubInfo: Missing parameters");
            }

            const channel = input?.channel || '';
            api.log("info", `getKnowledgeHubInfo: Interaction channel: ${channel}`);
            const tokens = await getToken(api, context, cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);
            const decodedToken: any = jwt.decode(tokens.id_token);
            // api.log("info", `getKnowledgeHubInfo: decoded id token: ${JSON.stringify(decodedToken)}`);
            const apiEndpointUrl = await getCxoneConfigUrl(api, context, decodedToken.iss, decodedToken.tenantId);
            api.log("info", `getKnowledgeHubInfo: got API endpoint URL: ${apiEndpointUrl}`);

            // Set contextRefId before call to KH
            if (!context.contextRefId) {
                context.contextRefId = "empty";
            }
            const khAnswer = await getKnowledgeHubAnswer(api, apiEndpointUrl, tokens.access_token, contactId, businessNumber, bedrockKbId, userUtterance, filters, context.contextRefId);

            // Set contextRefId - to maintain conversational context for KH
            if (khAnswer.contextRefId && context.contextRefId === "empty") {
                context.contextRefId = khAnswer.contextRefId;
            }
            if (storeLocation === "context") {
                api.addToContext(storeKey, khAnswer, "simple");
            } else {
                // @ts-ignore
                api.addToInput(storeKey, khAnswer);
            }
            api.log("info", `getKnowledgeHubInfo: Stored Knowledge Hub data in ${storeLocation} under key ${storeKey}. Data: ${JSON.stringify(khAnswer)}`);
            // api.output("", khAnswer);
        } catch (error) {
            api.log("error", `getKnowledgeHubInfo: Error getting information from Knowledge Hub: ${error.message}`);
            api.addToContext("getKnowledgeHubInfo", `Error getting information from Knowledge Hub for contactId: ${contactId}; error: ${error.message}`, 'simple');
            api.output("Something is not working. Please retry.", { error: error.message });
            throw error;
        }
    }
});