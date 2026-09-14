import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getToken, getCxoneOpenIdUrl, getCxoneConfigUrl, makeTokenRefresher, fetchWithAuthRetry } from "../helpers/cxone-utils.js";
import { parseJsonField, parseJsonObjectField } from "../helpers/json-field.js";
import * as jwt from "jsonwebtoken";

export interface IApiCallerParams extends INodeFunctionBaseParams {
    config: {
        environment: string;
        baseUrl?: string; // used only if environment === "other"
        apiSuffix: string;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        headers?: any; // JSON object, or JSON string
        body?: any; // JSON object, or JSON string
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

export const cxoneApiCaller = createNodeDescriptor({
    type: "cxoneApiCaller",
    defaultLabel: "CXone API Caller",
    summary: "Call any CXone API dynamically with configurable method, headers, and body",
    preview: {
        key: "method",
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
            description: "Specify custom Base URL if 'Other' is selected.",
            condition: { key: "environment", value: "other" },
            params: { required: true }
        },
        {
            key: "apiSuffix",
            label: "API Suffix / Endpoint",
            type: "cognigyText",
            description: "Path or query string to append to the base URL. E.g., 'incontactapi/services/v32.0/scripts/start?...'",
            params: { required: true }
        },
        {
            key: "method",
            label: "HTTP Method",
            type: "select",
            defaultValue: "GET",
            description: "The HTTP method to use for the API call.",
            params: {
                options: [
                    { label: "GET", value: "GET" },
                    { label: "POST", value: "POST" },
                    { label: "PUT", value: "PUT" },
                    { label: "PATCH", value: "PATCH" },
                    { label: "DELETE", value: "DELETE" }
                ],
                required: true
            }
        },
        {
            key: "headers",
            label: "Additional Headers (JSON)",
            type: "json",
            description: "Optional HTTP headers in JSON format. Authorization (the CXone bearer token) and Content-Type are added automatically - setting either of them here overrides the automatic value."
        },
        {
            key: "body",
            label: "Request Body (JSON)",
            type: "json",
            description: "Optional request body in JSON format for POST/PUT/PATCH/DELETE requests. Leave empty to send the request without a body; set it to {} to send an empty JSON object. Ignored for GET."
        },
        {
            key: "storeLocation",
            label: "Output Store Location",
            type: "select",
            description: "Choose API output store location.",
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
            description: "The name of the property (key) where you want to store the API payload.",
            params: {
                required: true
            }
        }
    ],
    form: [
        { type: "field", key: "environment" },
        { type: "field", key: "baseUrl" },
        { type: "field", key: "apiSuffix" },
        { type: "field", key: "method" },
        { type: "field", key: "headers" },
        { type: "field", key: "body" },
        { type: "field", key: "connection" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: { color: "#3694FD" },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api, context } = cognigy;
        const config = rawConfig as IApiCallerParams["config"];
        const { environment, baseUrl, method, headers, body, connection, storeLocation } = config;
        // trimmed: whitespace would end up in the request URL or in the context key
        const apiSuffix = (config.apiSuffix || "").trim();
        const storeKey = (config.storeKey || "").trim();

        if (!connection) {
            throw new Error("cxoneApiCaller: CXone API Connection not found");
        }
        if (!apiSuffix) {
            throw new Error("cxoneApiCaller: 'API Suffix / Endpoint' is required");
        }
        if (!storeKey) {
            throw new Error("cxoneApiCaller: 'Output Store Key' is required");
        }
        // validate and resolve the token issuer in one block, so baseUrl is known to be set below
        let tokenIssuer = environment;
        if (environment === "other") {
            if (!baseUrl || baseUrl.trim() === "") {
                throw new Error("cxoneApiCaller: Base URL is required when Environment is set to Other");
            }
            tokenIssuer = baseUrl.trim().replace(/\/+$/, ''); // remove trailing slashes
        }

        // Parse headers and body - a 'json' field can arrive as an object/array or as a JSON string
        const rawHeaders = parseJsonObjectField(api, headers, "cxoneApiCaller: Additional Headers");
        const parsedHeaders: Record<string, string> = {};
        // header values must be strings
        for (const [headerName, headerValue] of Object.entries(rawHeaders)) {
            if (headerValue === null || headerValue === undefined) continue;
            parsedHeaders[headerName] = typeof headerValue === "string" ? headerValue : JSON.stringify(headerValue);
        }
        api.log?.("info", `cxoneApiCaller: Additional headers: ${JSON.stringify(Object.keys(parsedHeaders))}`);

        // no body is valid for every method, including POST
        const parsedBody = parseJsonField(api, body, "cxoneApiCaller: Request Body");
        const sendBody = parsedBody !== undefined && method !== "GET";
        if (parsedBody !== undefined && method === "GET") {
            api.log?.("warn", `cxoneApiCaller: a Request Body is configured but GET requests are sent without one; put parameters in the API Suffix query string instead`);
        }
        api.log?.("info", `cxoneApiCaller: Request body: ${sendBody ? JSON.stringify(parsedBody) : "none"}`);

        // Get CXone token
        const tokenUrl = await getCxoneOpenIdUrl(api, context, tokenIssuer);
        const basicToken = Buffer.from(`${connection.clientId}:${connection.clientSecret}`).toString('base64');
        const cxOneConfig = {
            tokenUrl,
            accessKeyId: connection.accessKeyId,
            accessKeySecret: connection.accessKeySecret,
            basicToken
        };
        const tokens = await getToken(api, context, cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);

        // Decode token to get API endpoint
        const decodedToken: any = jwt.decode(tokens.id_token);
        const apiEndpointUrl = await getCxoneConfigUrl(api, context, decodedToken.iss, decodedToken.tenantId);

        // Build final URL
        const url = `${apiEndpointUrl}/${apiSuffix.replace(/^\/+/, "")}`;
        api.log?.("info", `cxoneApiCaller: Final Endpoint URL is: ${method} ${url}`);

        // lets the call survive a token that CXone considers expired
        const refreshToken = makeTokenRefresher(api, context, cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);

        try {
            const response = await fetchWithAuthRetry(api, "cxoneApiCaller", tokens.access_token, (accessToken: string) => ({
                url,
                init: {
                    method,
                    // the Authorization header is rebuilt on a retry, additional headers still win
                    headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json", ...parsedHeaders },
                    body: sendBody ? JSON.stringify(parsedBody) : undefined
                }
            }), refreshToken);

            const responseText = await response.text();
            let data: any;
            try { data = JSON.parse(responseText); } catch { data = responseText; }

            api.log?.("info", `cxoneApiCaller: Received API Payload: ${response.status}`);
            // the response body is stored for every status code, so make a failed call visible to the flow
            api.addToContext?.("CXoneApiCallerStatus", response.status, "simple");
            if (!response.ok) {
                api.log?.("error", `cxoneApiCaller: API returned ${response.status} ${response.statusText} for ${method} ${url}; response body stored in ${storeLocation}.${storeKey}. Check context.CXoneApiCallerStatus to branch on this in the flow.`);
            }
            if (storeLocation === "context") {
                api.addToContext?.(storeKey, data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(storeKey, data);
            }
            // the response can hold customer data - it is stored in ${storeLocation}.${storeKey} for the flow, so only its size is logged
            api.log?.("info", `cxoneApiCaller: Stored API Payload in ${storeLocation} under key ${storeKey}. Size: ${responseText.length} chars`);
        } catch (error: any) {
            api.log?.("error", `cxoneApiCaller Error Calling API: ${error.message}`);
            api.addToContext?.("CXoneApiCallerError", error.message, "simple");
            // the error details stay in the log and in the context - they are not sent to the channel
            api.output?.("Something is not working. Please retry.", null);
            throw error;
        }
    }
});
