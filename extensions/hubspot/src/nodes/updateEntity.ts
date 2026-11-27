import { Client } from '@hubspot/api-client';
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IUpdateEntityParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
        };
        entityType: string;
        entityId: string;
        properties: { [key: string]: string };
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const updateEntity = createNodeDescriptor({
    type: "updateEntity",
    defaultLabel: "Update Entity",
    summary: "Updates an existing contact, company, or ticket in HubSpot",
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
            key: "entityType",
            label: "Entity Type",
            type: "select",
            params: {
                required: true,
                options: [
                    {
                        label: "Contact",
                        value: "contact"
                    },
                    {
                        label: "Company",
                        value: "company"
                    },
                    {
                        label: "Ticket",
                        value: "ticket"
                    }
                ]
            },
            description: "Type of entity to update"
        },
        {
            key: "entityId",
            label: "Entity ID",
            type: "cognigyText",
            params: {
                required: true
            },
            description: "The ID of the entity to update"
        },
        {
            key: "properties",
            label: "Properties",
            type: "json",
            params: {
                required: true
            },
            description: "JSON object with HubSpot properties to update"
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
            defaultValue: "entityId",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "entityId",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "entityDetails",
            label: "Entity Details",
            defaultCollapsed: false,
            fields: [
                "entityType",
                "entityId"
            ]
        },
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
        { type: "section", key: "entityDetails" },
        { type: "field", key: "properties" },
        { type: "section", key: "storageOptions" }
    ],
    function: (async ({ cognigy, config }: IUpdateEntityParams) => {
        const { api } = cognigy;
        const { connection, entityType, entityId, properties, storeLocation, inputKey, contextKey } = config;

        try {
            const client = new Client({ accessToken: connection.accessToken });
            let entityResponse;
            let dataKey: string;

            // Update the entity based on type
            switch (entityType) {
                case 'contact':
                    entityResponse = await client.crm.contacts.basicApi.update(
                        entityId,
                        { properties: properties as { [key: string]: string } }
                    );
                    dataKey = "contactData";
                    break;
                case 'company':
                    entityResponse = await client.crm.companies.basicApi.update(
                        entityId,
                        { properties: properties as { [key: string]: string } }
                    );
                    dataKey = "companyData";
                    break;
                case 'ticket':
                    entityResponse = await client.crm.tickets.basicApi.update(
                        entityId,
                        { properties: properties as { [key: string]: string } }
                    );
                    dataKey = "ticketData";
                    break;
                default:
                    throw new Error(`Unsupported entity type: ${entityType}`);
            }

            // Store the result based on the selected location
            if (storeLocation === "context") {
                api.addToContext(contextKey, entityId, "simple");
                api.addToContext("success", true, "simple");
                api.addToContext("entityType", entityType, "simple");
                api.addToContext(dataKey, entityResponse, "simple");
            } else {
                api.addToInput(inputKey, entityId);
                api.addToInput("success", true);
                api.addToInput("entityType", entityType);
                api.addToInput(dataKey, entityResponse);
            }

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (storeLocation === "context") {
                api.addToContext("error", errorMessage, "simple");
                api.addToContext("success", false, "simple");
                api.addToContext("entityType", entityType, "simple");
            } else {
                api.addToInput("error", errorMessage);
                api.addToInput("success", false);
                api.addToInput("entityType", entityType);
            }
        }
    }) as any
}); 