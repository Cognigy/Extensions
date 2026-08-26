import { Client } from '@hubspot/api-client';
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ICreateEngagementParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
        };
        engagementType: string;
        properties: { [key: string]: string };
        contactIds?: string;
        companyIds?: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const createEngagementNode = createNodeDescriptor({
    type: "createEngagement",
    defaultLabel: "Create Engagement",
    summary: "Creates a new engagement in HubSpot",
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
            key: "engagementType",
            label: "Engagement Type",
            type: "select",
            params: {
                required: true,
                options: [
                    {
                        label: "Call",
                        value: "call"
                    },
                    {
                        label: "Email",
                        value: "email"
                    },
                    {
                        label: "Meeting",
                        value: "meeting"
                    },
                    {
                        label: "Task",
                        value: "task"
                    }
                ]
            },
            description: "Type of engagement to create"
        },
        {
            key: "properties",
            label: "Engagement Properties",
            type: "json",
            params: {
                required: true
            },
            description: "JSON object with engagement properties (e.g., subject, body, status)"
        },
        {
            key: "contactIds",
            label: "Contact IDs (Optional)",
            type: "cognigyText",
            description: "Comma-separated list of HubSpot Contact IDs to associate with the engagement"
        },
        {
            key: "companyIds",
            label: "Company IDs (Optional)",
            type: "cognigyText",
            description: "Comma-separated list of HubSpot Company IDs to associate with the engagement"
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
            defaultValue: "engagementId",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "engagementId",
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
        { type: "field", key: "engagementType" },
        { type: "field", key: "properties" },
        { type: "field", key: "contactIds" },
        { type: "field", key: "companyIds" },
        { type: "section", key: "storageOptions" }
    ],
    function: (async ({ cognigy, config }: ICreateEngagementParams) => {
        const { api } = cognigy;
        const { connection, engagementType, properties, contactIds, companyIds, storeLocation, inputKey, contextKey } = config;

        try {
            const client = new Client({ accessToken: connection.accessToken });

            // Create the engagement based on type
            let engagementResponse;
            switch (engagementType) {
                case 'call':
                    engagementResponse = await client.crm.objects.calls.basicApi.create({
                        properties: properties as { [key: string]: string },
                        associations: []
                    });
                    break;
                case 'email':
                    engagementResponse = await client.crm.objects.emails.basicApi.create({
                        properties: properties as { [key: string]: string },
                        associations: []
                    });
                    break;
                case 'meeting':
                    engagementResponse = await client.crm.objects.meetings.basicApi.create({
                        properties: properties as { [key: string]: string },
                        associations: []
                    });
                    break;
                case 'task':
                    engagementResponse = await client.crm.objects.tasks.basicApi.create({
                        properties: properties as { [key: string]: string },
                        associations: []
                    });
                    break;
                default:
                    throw new Error(`Unsupported engagement type: ${engagementType}`);
            }

            // Associate with contacts if provided
            if (contactIds) {
                const contactIdList = contactIds.split(',').map(id => id.trim());
                for (const contactId of contactIdList) {
                    try {
                        await client.crm.associations.v4.basicApi.create(
                            engagementType,
                            parseInt(engagementResponse.id),
                            "contacts",
                            parseInt(contactId),
                            [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 1 }]
                        );
                    } catch (assocError: unknown) {
                        console.warn(`Failed to associate ${engagementType} with contact ${contactId}: ${assocError instanceof Error ? assocError.message : String(assocError)}`);
                    }
                }
            }

            // Associate with companies if provided
            if (companyIds) {
                const companyIdList = companyIds.split(',').map(id => id.trim());
                for (const companyId of companyIdList) {
                    try {
                        await client.crm.associations.v4.basicApi.create(
                            engagementType,
                            parseInt(engagementResponse.id),
                            "companies",
                            parseInt(companyId),
                            [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 1 }]
                        );
                    } catch (assocError: unknown) {
                        console.warn(`Failed to associate ${engagementType} with company ${companyId}: ${assocError instanceof Error ? assocError.message : String(assocError)}`);
                    }
                }
            }

            // Store the result based on the selected location
            if (storeLocation === "context") {
                api.addToContext(contextKey, engagementResponse.id, "simple");
                api.addToContext("engagement", engagementResponse, "simple");
                api.addToContext("success", true, "simple");
            } else {
                api.addToInput(inputKey, engagementResponse.id);
                api.addToInput("engagement", engagementResponse);
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