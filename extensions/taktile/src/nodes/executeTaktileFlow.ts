import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

interface ITaktileConfig {
    apiKeyConnection: {
        apiKey: string;
    };
    flowSlug: string;
    customerName: string;
    customerDob: string;
    metadata: {
        version: string;
        entity_id: string;
    };
    control: {
        execution_mode: string;
    };
}

export const executeTaktileFlow = createNodeDescriptor({
    type: "executeTaktileFlow",
    defaultLabel: "Taktile API",
    summary: "Executes a Taktile decision flow",
    fields: [
        {
            key: "apiKeyConnection",
            label: "Taktile API Connection",
            type: "connection",
            params: {
                connectionType: "apiKey",
                required: true
            }
        },
        {
            key: "flowSlug",
            label: "Flow Slug",
            type: "cognigyText",
            defaultValue: "cognigy-test-api",
            params: { required: true }
        },
        {
            key: "customerName",
            label: "Customer Name",
            type: "cognigyText",
            params: { required: true }
        },
        {
            key: "customerDob",
            label: "Customer DOB (YYYY-MM-DD)",
            type: "cognigyText",
            params: { required: true }
        },
        {
            key: "metadata",
            label: "Metadata",
            type: "json",
            defaultValue: {
                version: "v1.1",
                entity_id: "string"
            },
            params: { required: true }
        },
        {
            key: "control",
            label: "Control",
            type: "json",
            defaultValue: {
                execution_mode: "sync"
            },
            params: { required: true }
        }
    ],
    sections: [
        {
            key: "request",
            label: "Request Configuration",
            defaultCollapsed: false,
            fields: ["flowSlug", "customerName", "customerDob"]
        },
        {
            key: "advanced",
            label: "Advanced Settings",
            defaultCollapsed: true,
            fields: ["metadata", "control"]
        }
    ],
    form: [
        { type: "field", key: "apiKeyConnection" },
        { type: "section", key: "request" },
        { type: "section", key: "advanced" }
    ],
    appearance: {
        color: "#009EDB"
    },
    function: async ({ config, cognigy }: INodeFunctionBaseParams) => {
        const typedConfig = config as ITaktileConfig;
        const { flowSlug, customerName, customerDob, metadata, control, apiKeyConnection } = typedConfig;
        const { api } = cognigy;

        if (!apiKeyConnection?.apiKey) {
            api.addToContext("taktileError", "API Key is required", "simple");
            return;
        }

        try {
            const response = await axios.post(
                `https://eu-sandbox.azp.decide.taktile.com/run/api/v1/flows/${flowSlug}/decide`,
                {
                    data: {
                        customer_name: customerName,
                        customer_dob: customerDob
                    },
                    metadata,
                    control
                },
                {
                    headers: {
                        "accept": "application/json",
                        "X-Api-Key": apiKeyConnection.apiKey,
                        "Content-Type": "application/json"
                    }
                }
            );

            api.addToContext("taktileResponse", response.data, "simple");
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                api.addToContext("taktileError", `Taktile API Error: ${error.response?.data?.message || error.message}`, "simple");
            } else {
                api.addToContext("taktileError", error.message || "Unknown error occurred", "simple");
            }
        }
    }
});