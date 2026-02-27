import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getServerTokenSignature, expertApiCall } from "../helpers/expert-utils";

export interface IExpertApiCallerParams extends INodeFunctionBaseParams {
    config: {
        hostname: string;
        user: string;
        apiPath: string;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        body?: string;
        storeLocation: string;
        storeKey: string;
        connection: {
            serverKey: string;
            serverSecret: string;
        };
    };
}

export const expertApiCaller = createNodeDescriptor({
    type: "expertApiCaller",
    defaultLabel: "Expert API Caller",
    summary: "Call Expert API dynamically with Server API Token",
    preview: {
        key: "method",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "Expert Connection",
            type: "connection",
            params: { connectionType: "expertConnection", required: true }
        },
        {
            key: "hostname",
            label: "Expert Hostname",
            type: "text",
            params: { required: true },
            description: "Expert site hostname, e.g., authtalk.mindtouch.es"
        },
        {
            key: "user",
            label: "User",
            type: "text",
            params: { required: true },
            description: "Username prefixed with '=' or user ID"
        },
        {
            key: "apiPath",
            label: "API Path",
            type: "cognigyText",
            params: { required: true },
            description: "API endpoint path, e.g., /@api/deki/pages/home/info"
        },
        {
            key: "method",
            label: "HTTP Method",
            type: "select",
            defaultValue: "GET",
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
            key: "body",
            label: "Request Body (JSON)",
            type: "json",
            description: "Optional request body for non-GET requests"
        },
        {
            key: "storeLocation",
            label: "Output Store Location",
            type: "select",
            defaultValue: "context",
            params: {
                options: [
                    { label: "Context", value: "context" },
                    { label: "Input", value: "input" }
                ]
            }
        },
        {
            key: "storeKey",
            label: "Output Store Key",
            type: "cognigyText",
            params: { required: true }
        }
    ],
    form: [
        { type: "field", key: "hostname" },
        { type: "field", key: "user" },
        { type: "field", key: "apiPath" },
        { type: "field", key: "method" },
        { type: "field", key: "body" },
        { type: "field", key: "connection" },
        { type: "field", key: "storeLocation" },
        { type: "field", key: "storeKey" }
    ],
    appearance: { color: "#27C7FE" },
    function: async ({ cognigy, config }: IExpertApiCallerParams) => {
        const { api, context } = cognigy;
        const { hostname, user, apiPath, method, body, connection, storeLocation, storeKey } = config;

        if (!connection) throw new Error("Expert API Caller: Connection not found");

        // Generate Server API Token signature
        const signature = getServerTokenSignature(connection.serverKey, connection.serverSecret, user);

        const url = `https://${hostname}${apiPath.startsWith("/") ? apiPath : "/" + apiPath}`;
        api.log("info", `Expert API Caller: Calling ${method} ${url}`);

        try {
            const data = await expertApiCall(url, signature, method, body);
            if (storeLocation === "context") api.addToContext(storeKey, data, "simple");
            // @ts-ignore
            else api.addToInput(storeKey, data);
            api.log("info", `Expert API Caller: Stored response under ${storeLocation}.${storeKey}`);
        } catch (error: any) {
            api.log("error", `Expert API Caller Error: ${error.message}`);
            api.addToContext("ExpertApiCallerError", error.message, "simple");
            throw error;
        }
    }
});