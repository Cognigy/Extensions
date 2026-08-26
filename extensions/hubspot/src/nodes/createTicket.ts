import { Client } from '@hubspot/api-client';
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ICreateTicketParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
        };
        properties: { [key: string]: string };
        contactId?: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const createTicket = createNodeDescriptor({
    type: "createTicket",
    defaultLabel: "Create Ticket",
    summary: "Creates a new ticket in HubSpot",
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
            label: "Ticket Properties",
            type: "json",
            params: {
                required: true
            },
            description: "JSON object with HubSpot ticket properties (e.g., hs_pipeline, hs_pipeline_stage, subject)"
        },
        {
            key: "contactId",
            label: "Contact ID (Optional)",
            type: "cognigyText",
            description: "HubSpot Contact ID to associate the ticket with"
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
            defaultValue: "ticketId",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "ticketId",
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
        { type: "field", key: "contactId" },
        { type: "section", key: "storageOptions" }
    ],
    function: (async ({ cognigy, config }: ICreateTicketParams) => {
        const { api } = cognigy;
        const { connection, properties, contactId, storeLocation, inputKey, contextKey } = config;

        try {
            const client = new Client({ accessToken: connection.accessToken });
            
            // Create the ticket
            const ticketResponse = await client.crm.tickets.basicApi.create({ 
                properties: properties as { [key: string]: string },
                associations: []
            });

            const ticketId = ticketResponse.id;

            // Associate with contact if contactId is provided
            if (contactId) {
                try {
                    await client.crm.associations.v4.basicApi.create(
                        "tickets",
                        Number(ticketId),
                        "contacts", 
                        Number(contactId),
                        [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 16 }]
                    );
                } catch (associationError: unknown) {
                    api.log("warn", `Failed to associate ticket with contact: ${associationError instanceof Error ? associationError.message : String(associationError)}`);
                }
            }

            // Store the result based on the selected location
            if (storeLocation === "context") {
                api.addToContext(contextKey, ticketId, "simple");
                api.addToContext("success", true, "simple");
                api.addToContext("ticketData", ticketResponse, "simple");
            } else {
                api.addToInput(inputKey, ticketId);
                api.addToInput("success", true);
                api.addToInput("ticketData", ticketResponse);
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