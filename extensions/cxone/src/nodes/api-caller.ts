import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getToken, getCxoneOpenIdUrl, getCxoneConfigUrl } from "../helpers/cxone-utils";
import * as jwt from "jsonwebtoken";

export interface IApiCallerParams extends INodeFunctionBaseParams {
    config: {
        environment: string;
        baseUrl?: string; // used only if environment === "other"
        apiSuffix: string;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        headers?: string; // JSON string
        body?: string; // JSON string
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
            description: "Optional HTTP headers in JSON format (Authorization and Content-Type headers are set automatically)."
        },
        {
            key: "body",
            label: "Request Body (JSON)",
            type: "json",
            description: "Optional request body in JSON format for POST/PUT/PATCH/DELETE requests."
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
    function: async ({ cognigy, config }: IApiCallerParams) => {
        const { api, context } = cognigy;
        const { environment, baseUrl, apiSuffix, method, headers, body, connection, storeLocation, storeKey } = config;

        if (!connection) {
            throw new Error("cxoneApiCaller: CXone API Connection not found");
        }
        if (environment === "other") {
            if (!baseUrl || baseUrl.trim() === "") {
                throw new Error("cxoneApiCaller: Base URL is required when Environment is set to Other");
            }
        }

        let tokenIssuer = environment;
        if (environment === "other") {
            tokenIssuer = baseUrl.trim().replace(/\/+$/, ''); // remove trailing slashes
        }

        // Parse headers and body
        let parsedHeaders = {};
        try {
            parsedHeaders = headers ? JSON.parse(headers) : {};
        } catch {
            throw new Error("cxoneApiCaller: Headers must be valid JSON");
        }
        let parsedBody: any;
        try {
            if (!body) parsedBody = undefined;
            else if (typeof body === "string") parsedBody = JSON.parse(body);
            else parsedBody = body; // already a JSON object
        } catch {
            throw new Error("cxoneApiCaller: Body must be valid JSON");
        }
        if (method !== "GET" && !parsedBody) {
            throw new Error("cxoneApiCaller: Request body is required for non-GET methods");
        }

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
        api.log("info", `cxoneApiCaller: Final Endpoint URL is: ${method} ${url}`);

        // Add Authorization header
        const finalHeaders = { "Authorization": `Bearer ${tokens.access_token}`, "Content-Type": "application/json", ...parsedHeaders };

        try {
            const response = await fetch(url, {
                method,
                headers: finalHeaders,
                body: parsedBody && method !== "GET" ? JSON.stringify(parsedBody) : undefined
            });

            const responseText = await response.text();
            let data: any;
            try { data = JSON.parse(responseText); } catch { data = responseText; }

            api.log("info", `cxoneApiCaller: Received API Payload: ${response.status}`);
            if (storeLocation === "context") {
                api.addToContext(storeKey, data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(storeKey, data);
            }
            // api.output("", { status: response.status, data });
            api.log("info", `cxoneApiCaller: Stored API Payload in ${storeLocation} under key ${storeKey}. Data: ${JSON.stringify(data)}`);
        } catch (error: any) {
            api.log("error", `cxoneApiCaller Error Calling API: ${error.message}`);
            api.addToContext("CXoneApiCallerError", error.message, "simple");
            api.output("Something is not working. Please retry.", { error: error.message });
            throw error;
        }
    }
});