import { Client } from '@hubspot/api-client';
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ICreateContactParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
        };
        properties: { [key: string]: string };
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const createContactNode = createNodeDescriptor({
    type: "createContact",
    defaultLabel: "Create Contact",
    summary: "Creates a new contact in HubSpot",
    fields: [
        {
            key: "connection",
            label: "HubSpot Connection",
            type: "connection",
            params: {
                connectionType: "hubspot",
                required: true
            }
        },
        {
            key: "properties",
            label: "Contact Properties",
            type: "json",
            params: {
                required: true
            },
            description: "JSON object with HubSpot contact properties (e.g., firstname, lastname, email)"
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            defaultValue: "input",
            params: {
                options: [
                    {
                        label: "Input",
                        value: "input"
                    },
                    {
                        label: "Context",
                        value: "context"
                    }
                ],
                required: true
            }
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "contactId",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "contactId",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "storageOptions",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "properties" },
        { type: "section", key: "storageOptions" }
    ],
    function: (async ({ cognigy, config }: ICreateContactParams) => {
        const { api } = cognigy;
        const { connection, properties, storeLocation, inputKey, contextKey } = config;

        try {
            const client = new Client({ accessToken: connection.accessToken });
            const response = await client.crm.contacts.basicApi.create({ 
                properties: properties as { [key: string]: string },
                associations: []
            });
            
            // Store the result based on the selected location
            if (storeLocation === "context") {
                api.addToContext(contextKey, response.id, "simple");
                api.addToContext("contact", response, "simple");
                api.addToContext("success", true, "simple");
            } else {
                api.addToInput(inputKey, response.id);
                api.addToInput("contact", response);
                api.addToInput("success", true);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (storeLocation === "context") {
                api.addToContext("error", errorMessage, "simple");
                api.addToContext("success", false, "simple");
            } else {
                api.addToInput("error", errorMessage);
                api.addToInput("success", false);
            }
        }
    }) as any
});
